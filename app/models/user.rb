class User < ActiveRecord::Base

  include Concerns::RSAPublicKeyEncryptor

  attr_accessor :current_password

  has_many :roles, inverse_of: :user
  has_many :individuals, inverse_of: :user
  has_many :vendors, inverse_of: :user
  has_many :invoices, inverse_of: :user
  has_many :line_items, through: :vendors
  has_many :numbers, through: :individuals
  has_many :accounts
  has_many :sms_threads
  has_many :sms_messages, through: :sms_threads
  has_many :addresses
  has_many :polymorphic_addresses, as: :addressable, class_name: 'Address'
  has_many :qb_classes, inverse_of: :user
  belongs_to :liability_account, class_name: "Account", foreign_key: :liability_account_id
  belongs_to :expense_account, class_name: "Account", foreign_key: :expense_account_id
  belongs_to :bank_account, class_name: "Account", foreign_key: :bank_account_id
  belongs_to :default_class, foreign_key: :default_class_id

  encrypt :routing_number, :bank_account_number, obfuscate_with: Obfuscator.new

  # validates :routing_number, presence: true
  # validates :bank_account_number, presence: true
  # validates :billing_address1, presence: true
  # validates :billing_city, presence: true
  # validates :billing_state, presence: true
  # validates :billing_zip, presence: true

  validates :terms_of_service, acceptance: { accept: true }
  validates :mobile_phone, uniqueness: true, length: { minimum: 8, maximum: 12 }, if: :mobile_phone_present
  validate :mobile_phone_validity

  before_save :parse_number, :recalculate_accounts_defaults, :resync_invoices,
    :check_verification, :set_signature_at
  after_create :add_to_allowed_numbers
  after_save :update_intercom

  enum verification_status: [:not_verified, :in_process, :verified]

  # validates_attachment :signature, content_type:
  #  { content_type: ["image/jpg", "image/jpeg"] }

   # TODO: This method should be better integrated with Registration
   def self.find_for_open_id(access_token, user = nil, params)
     raise "Quickbooks integration is currently very broken and does not work at all."
     data = access_token.info
     unless user = User.where(:email => data["email"]).first
       user = Registration.create(
         :email => data["email"],
         :password => Devise.friendly_token[0,20],
         :terms_of_service => true
       )
     end
     user.update_attributes(qb_token: access_token.token, qb_secret: access_token.secret, realm_id: params[:realmId])
     user.sync_qb_accounts if user.intuit_authentication?
     user
   end

  def sync_with_quickbooks_desktop
    QBWC.add_job(:get_company, true, '', QuickbooksWC::CompanyWorker, [])
    QBWC.add_job(:update_user_accounts, true, '', QuickbooksWC::AccountSyncWorker, [])
    QBWC.add_job(:sync_qb_classes, true, '', QuickbooksWC::QbClassSyncWorker, [])
    QBWC.add_job(:update_all_vendors, true, '', QuickbooksWC::VendorsSyncWorker, [])
    QBWC.add_job(:update_vendors, true, '', QuickbooksWC::VendorWorker, [])
    QBWC.add_job(:update_accounts, true, '', QuickbooksWC::AccountWorker, [])
    QBWC.add_job(:update_bills, true, '', QuickbooksWC::BillWorker, [])
    QBWC.add_job(:update_bills_payments, false, '', QuickbooksWC::BillsPaymentSyncWorker, [])

    invoices.where(status: [4,5,6,7,8]).where.not(txn_id: nil, vendor_id: nil).update_all(sync_qb: false, search_on_qb: true, bill_payment_txn_id: nil, qb_bill_paid_at: nil, request_number: 0)
    invoices.where(status: [4,5,6,7,8]).where(txn_id: nil).where.not(vendor_id: nil).update_all(sync_qb: true, bill_payment_txn_id: nil, qb_bill_paid_at: nil, request_number: 0)
    update_columns(synced_qb: true, qb_company_name: nil, authorized_to_sync: false,
                   qb_wrong_company: nil, last_qb_sync: nil, sync_count: 0)
    vendors.only_parents.where.not(qb_d_id: nil, name: nil).update_all(sync_qb: false, search_on_qb: true, request_number: 0)
    vendors.only_parents.where.not(name: nil).where(qb_d_id: nil).update_all(sync_qb: true, search_on_qb: false, request_number: 0)
    qb_classes.update_all(sync_qb: true, search_on_qb: true, edit_sequence: nil, qb_d_id: nil)
    accounts.update_all(sync_qb: false, search_on_qb: true, edit_sequence: nil, qb_d_id: nil, parent_ref: nil, request_number: 0)
    true
  end

  def payment_numbers
    individuals.collect {|i| i.number.string if i.permissions.include?("pay_approved-Payment") && i.number }.compact
  end

  def all_addresses
    addresses.where(parent_id: nil)
  end

  def to_payments_csv
    [id, business_name, billing_address1, billing_address2, billing_city, billing_state, billing_zip]
  end

  def liability_accounts
    arr = accounts.active.where(classification: "Liability")
    return arr if arr.present?
    accounts.active.where(classification: "AccountsPayable")
  end

  def expense_accounts
    accounts.active.where(classification: ["Expense", "CostOfGoodsSold"])
  end

  def bank_accounts
    accounts.active.where(account_type: "Bank")
  end

  def formated_addresses(scope = :by_user)
    addresses.send(scope).collect(&:formated_address_with_id)
  end

  def save_authentication(qb_token, qb_secret, realm_id)
    update_attributes(
      qb_token: qb_token, qb_secret: qb_secret, realm_id: realm_id,
      token_expires_at: 6.months.from_now.utc, reconnect_token_at: 5.months.from_now.utc
    )
  end

  def increase_check_number
    update_attribute(:check_number, self.check_number += 1)
  end

  def valid_user?
    [
      business_name, bank_account_number, routing_number, billing_address1,
      billing_city, billing_state, billing_zip, signature
    ].all?(&:present?) && verified?
  end

  def connected_to_quickbooks?
    self.qb_token.present?
  end

  def email_confirmed?
    individuals.any? &:confirmed?
  end

  alias_method :valid_user, :valid_user?

  def selected_number
    numbers.where(selected: true).first
  end

  def mobile_phone_present
    return false unless mobile_phone.present?
    mobile_phone_changed? || !persisted?
  end

  def user_oauth_intuit
    @user_oauth_intuit ||= OAuth::AccessToken.new($qb_oauth_consumer, qb_token, qb_secret)
  end

  def intuit_authentication?
    @intuit_authentication ||= [qb_token, qb_secret].all?(&:present?)
  end

  alias_method :intuit_authentication, :intuit_authentication?

  def sync_qb_accounts
    return unless intuit_authentication?
    # UserSyncWorker.perform_async(id)
    QuickbooksSync::Users::UserAccountsSync.find(id).sync!
    invoices.each do |invoice|
      invoice.sync_with_quickbooks
    end
  end

  def disconnect_from_quickbooks!
    if intuit_authentication?
      disconnect_from_quickbooks_online!
    end
    reset_sync_fields!
  end

  def disconnect_from_quickbooks_online!
    service = Quickbooks::Service::AccessToken.new
    service.access_token = user_oauth_intuit
    service.company_id = realm_id
    service.disconnect
  end

  def reset_sync_fields!
    update_attributes(qb_token: nil, qb_secret: nil, realm_id: nil, synced_qb: false)
  end

  def add_to_allowed_numbers
    return true unless mobile_phone.present?
    numbers.create(string: mobile_phone, selected: true)
  end

  def mobile_phone_validity
    return unless mobile_phone.present?
    server_number
  end

  def server_number
    errors.add(:mobile_phone, "this number is not available") if Number::RESTRICTED_NUMBERS.include?(mobile_phone)
  end

  def parse_number
    return true unless mobile_phone.present?
    if mobile_phone.starts_with?('1') && mobile_phone.length >= 10
      self.mobile_phone = "+#{mobile_phone}"
    else
      self.mobile_phone = "+1#{mobile_phone}" unless mobile_phone.starts_with?('+')
    end
    true
  end

  def number_of_alerts
    ids = invoices.pluck(:id)
    Alert.where(invoice_owner_id: ids).count
  end

  def number_of_vendors_on_autopay
    vendors.autopay.count
  end

  def number_of_users_added
    [numbers.count, individuals.size].sum
  end

  def invoices_proccesed_by_turk
    invoices.where(processed_by_turk: true)
  end

  def most_used_vendor
    most_used_vendor_id = vendors.joins(:invoices).group('vendors.id').count.max.try(:first)
    Vendor.find(most_used_vendor_id) if most_used_vendor_id
  end

  def date_before_check_sent
    invoices.order('act_by ASC').where('act_by >= ?', Date.today).first.try(:act_by)
  end

  def recalculate_accounts_defaults
    if expense_account_id_changed?
      vendors.where(selected_from_default_expense: true).update_all(expense_account_id: expense_account_id)
      vendors.where(selected_from_default_expense: false, liability_account_id: nil).update_all(expense_account_id: expense_account_id, selected_from_default_expense: true)
    end
    if liability_account_id_changed?
      vendors.where(selected_from_default_liability: true).update_all(liability_account_id: liability_account_id)
      vendors.where(selected_from_default_liability: false, liability_account_id: nil).update_all(liability_account_id: liability_account_id, selected_from_default_liability: true)
    end
    true
  end

  def resync_invoices
    return true unless synced_qb
    return true unless bank_account_id_changed?
    invoices.where(status: [4,5,6,7]).each do |invoice|
      invoice.sync_with_quickbooks_desktop(true)
    end
    true
  end

  def update_intercom
    return true unless Rails.env.production? || Rails.env.development? || Rails.env.staging?
    IntercomUpdater.delayed_update self
  end

  def check_verification
    return true unless [bank_account_number_changed?, routing_number_changed?].any?
    self.ach_date = nil
    if [bank_account_number?, routing_number].all?(&:present?)
      set_sample_ammounts
      self.verification_status = :in_process
    else
      self.first_amount_verification = nil
      self.second_amount_verification = nil
      self.verification_status = :not_verified
    end
    true
  end

  def set_sample_ammounts
    [:first_amount_verification, :second_amount_verification].each do |field|
      sample_amount = (1..25).to_a.sample
      amount = "0.#{sample_amount < 10 ? "0#{sample_amount}" : sample_amount }".to_d
      self.send("#{field}=", amount)
    end
  end

  def add_verification_attempts!
    self.verification_attempts += 1
    save
  end

  def reset_verification_process
    self.verification_attempts = 0
    not_verified!
    true
  end

  def verify_bank_information(params)
    values = params.values_at(:one, :two).sort
    return false unless values.all?(&:present?)
    if values == [first_amount_verification, second_amount_verification].sort
      verified!
      true
    else
      add_verification_attempts!
      reset_verification_process if verification_attempts == 3
      false
    end
  end

  def set_signature_at
    return true unless signature.present? && signature_changed? && signature_was == nil
    self.signature_created_at = Time.now
    true
  end

  def signature_filename
    [id, business_name, signature_created_at.to_date.strftime('%m_%d_%Y'), ".jpg"].join('_')
  end

  def uniq_business_name
    [id, business_name].join("-")
  end

  def self.find_by_uniq_business_name(string)
    query = { id: string.split('-')[0], business_name: string.split('-')[1]}
    where(query).first
  end

  def first_sync?
    (sync_count || 0) < 3
  end

  def add_sync_count
    i = sync_count || 0
    update_column(:sync_count, i += 1)
  end

  def valid_for_payments?
    [signature, billing_address1, billing_city, billing_state, billing_zip].all?(&:present?)
  end

  def total_verification_deposited
    first_amount_verification + second_amount_verification
  end

end
