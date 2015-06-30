class Vendor < ActiveRecord::Base
  include Concerns::RSAPublicKeyEncryptor

  attr_accessor :synced

  WIRE_PAYMENT_FIELDS  = [:routing_number, :bank_account_number]
  CHECK_PAYMENT_FIELDS = [:address1, :city, :zip, :state]

  VENDOR_BUILDER_ATTRIBUTES = [:name, :address1, :address2, :city, :state, :zip, :email]

  enum source: [:user, :worker]

  enum auto_pay_weekly: {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  }

  enum payment_term: {
    pay_after_bill_received: 0,
    pay_day_of_month: 1,
    pay_before_due_date: 2,
    pay_after_bill_date: 3,
    pay_after_due_date: 4,
    pay_weekly: 5
  }

  enum payment_term_end: {
    keep_paying: 0,
    pay_amount_exeeds: 1,
    end_pay_after_n_payments: 2,
    pay_before_date: 3,
    end_auto_pay_alert: 4
  }

  enum payment_ammount_type: [:full_payment, :fixed_amount]

  enum created_by: [:by_user, :by_worker]

  enum payment_status: {
    do_not_autopay: 0,
    autopay: 1,
    allways_mark_as_paid: 2
  }

  enum status: [:active, :inactive]

  belongs_to :user, inverse_of: :vendors
  belongs_to :liability_account, class_name: "Account", foreign_key: :liability_account_id
  belongs_to :expense_account, class_name: "Account", foreign_key: :expense_account_id
  belongs_to :qb_class, foreign_key: :default_qb_class_id
  belongs_to :parent, class_name: 'Vendor', foreign_key: :parent_id
  has_many :invoices, inverse_of: :vendor
  has_many :alerts, as: :alertable
  has_many :line_items, inverse_of: :vendor
  has_many :invoice_transactions, through: :line_items
  has_many :childrens, class_name: 'Vendor', foreign_key: :parent_id
  has_many :alert_settings, class_name: 'VendorAlertSettings'

  encrypt :routing_number, :bank_account_number, obfuscate_with: Obfuscator.new

  after_initialize :set_defaults
  before_save :set_qb_d_name
  before_save :cancel_accounts_default
  before_save :sync_with_user_accounts, :sync_with_quickbooks_desktop
  before_save :recalculate_line_items_default
  before_save :set_comparation_string
  before_save :set_status
  after_save :calculate_invoices_due_dates_if_payment_term_changed
  after_save :update_bills_if_autopay_changed
  after_save :recalculate_invoices_statuses
  after_save :update_intercom
  after_commit :sync_with_quickbooks, :recalculate_invoice_item_hit_creation
  after_update :duplicate_vendor
  after_initialize :build_alert_settings, :if => proc { |o| o.alert_settings.nil? }

  accepts_nested_attributes_for :invoices, :alert_settings

  has_paper_trail

  # validates :name, presence: true

  # validate :group_fields

  normalize_attribute  :address1, :address2, :zip, with: [:squish, :blank] do |value|
    value.present? && value.is_a?(String) ? value.downcase : value
  end

  normalize_attribute :state, with: [:squish, :blank] do |value|
    value.present? && value.is_a?(String) ? value.upcase : value
  end

  normalize_attribute :city, with: [:squish, :blank] do |value|
    value.present? && value.is_a?(String) ? value.titleize : value
  end

  normalize_attribute :name, with: [:squish, :blank] do |value|
    value.present? && value.is_a?(String) ? value.downcase.titleize : value
  end

  delegate :liability_accounts, :expense_accounts, :to => :user

  delegate :archived_invoices, :less_than_30, :more_than_30, :to => :invoices

  def self.typeahead_search(params, current_user)
    name = params[:name].try(:downcase)
    if user = current_user
      user.vendors.active.where("lower(name) LIKE ?", "#{name}%")
    elsif user = InvoiceModeration.find_by(invoice_id: params[:invoice_id]).try(:invoice).try(:user)
      user.vendors.active.by_user.where("lower(name) LIKE ?", "#{name}%")
    else
      []
    end
  end

  def self.only_parents
    where(parent_id: nil)
  end

  def valid_vendor_fields?
    fields = VENDOR_BUILDER_ATTRIBUTES.collect { |e| send(e) }
    fields.all?(&:present?)
  end

  def formated_vendor
    [name, address1, address2, city, state].map { |e| e.present? ? e : '?' }.join(', ')
  end

  def unique_line_items(send_as_json = false)
    line_items.uniq_items(send_as_json)
  end

  def wire_payment_fields_filled?
    !WIRE_PAYMENT_FIELDS.any? {|field| send(field).blank? }
  end

  def check_payment_fields_filled?
    !CHECK_PAYMENT_FIELDS.any? {|field| send(field).blank? }
  end

  def wire_or_payment_fields_filled?
    wire_payment_fields_filled? || check_payment_fields_filled?
  end

  alias_method :valid_vendor?, :wire_or_payment_fields_filled?

  def autopay_active?
    autopay?
  end

  def pay_day_of_month_date
    today = Date.current
    max_days = Time.days_in_month(today.month)
    day = day_of_the_month >= max_days ? max_days : day_of_the_month
    Date.new(today.year, today.month, day)
  end

  def set_defaults
    self.after_recieved ||= user.try(:default_due_date)
  end

  def vendor_ref
    return nil unless qb_id
    vendor = Quickbooks::Model::BaseReference.new
    vendor.name = name
    vendor.value = qb_id
    vendor
  end

  def set_pay_before_due_date(due_date, created_at)
    created_at = created_at ? created_at : Date.today
    if before_due_date == 0
      due_date || created_at.to_date
    else
      if due_date
        before_due_date.business_day.before(due_date).to_date
      else
        1.business_day.before(created_at.to_date).to_date
      end
    end
  end

  def set_pay_after_due_date(due_date, created_at)
    created_at = created_at ? created_at : Date.today
    if after_due_date == 0
      created_at
    else
      after_due_date.business_day.after(due_date).to_date
    end
  end

  def sync_with_quickbooks
    return true if synced
    return true unless user && user.intuit_authentication?
    return true unless check_payment_fields_filled?
    self.synced = true
    # QuickbooksSync::Vendors::Vendor.find(id).sync!
  end

  def merge!(merge_id)
    vendor = Vendor.find(merge_id)
    childrens << [vendor.childrens, vendor].flatten
    touch
  end

  def unmerge!
    update_attributes(parent_id: nil)
    invoices.where(status: [4,5,6,7,8,11]).where.not(txn_id: nil).update_all(sync_qb: true)
  end

  def synced_qb?
    edit_sequence && qb_d_id
  end

  def qb_xml_attributes
    hash = {}
    hash[:list_id] = qb_d_id if qb_d_id && edit_sequence
    hash[:edit_sequence] = edit_sequence if edit_sequence && qb_d_id
    hash.merge!({ name: qb_d_name, is_active: active?, company_name: qb_d_name })
    hash.merge!(vendor_address: vendor_address_attributes) if vendor_address_attributes.any?
    hash.merge!({name_on_check: "#{name}".truncate(41, omission: '') })

    hash
  end

  def vendor_address_attributes
    hash = {
      addr1: address1,
      addr2: address2,
      city: city,
      state: state,
      postal_code: zip
    }
    hash.delete_if {|k,v| v.nil? || v.try(:blank?) }
    hash
  end

  def to_qb_xml
    search_on_qb ? query_qb_d : update_or_create_xml_qb
  end

  def sync_with_quickbooks_desktop
    return true unless name.present?
    return true unless [name_changed?, address1_changed?, address2_changed?, city_changed?, zip_changed?, routing_number_changed?, bank_account_number_changed?, liability_account_id_changed?].any?
    self.search_on_qb = true unless qb_d_id
    self.sync_qb = true
    true
  end

  def sync_with_quickbooks_desktop!
    self.search_on_qb = true unless qb_d_id
    self.sync_qb = true
    save
    QBWC.add_job(:update_vendors, true, '', QuickbooksWC::VendorWorker, [] )
    true
  end

  def query_qb_d
    {
      vendor_query_rq: {
        xml_attributes: { "requestID" => id },
        full_name: qb_d_name
      }
    }
  end

  def update_or_create_xml_qb
    sync_type = qb_d_id ? :vendor_mod : :vendor_add

    {
      "#{sync_type}_rq".to_sym => {
        xml_attributes: { "requestID" => id },
        sync_type => qb_xml_attributes
      }
    }
  end

  def resync_invoices
    invoices.where(status: [4,5,6,7]).each do |invoice|
      invoice.sync_with_quickbooks_desktop(true)
    end
  end

  def default_item
    line_items.find_or_create_by(description: InvoiceTransaction::DEFAULT_ITEM_NAME)
  end

  def invoices
    return super unless children_ids.any?
    ids = [id, children_ids].flatten.compact
    Invoice.where(vendor_id: ids)
  end

  def default_liability_account
    @default_liability_account ||= liability_account || user.liability_account || user.accounts.where(name: "Accounts Payable (A/P)").first
  end

  private

  def group_fields
    return if wire_or_payment_fields_filled?
    errors.add(:groupFields, "Must have a payment method (Wire/Check filled out for every vendor")
  end

  def update_bills_if_autopay_changed
    return true unless payment_term_changed? && autopay_active?
    invoices.ready_for_payment.update_all(status: 5)
    true
  end

  def sync_with_user_accounts
    return true unless user
    set_account_liablility_default if selected_from_default_liability || new_record? || !liability_account
    set_account_expense_default if selected_from_default_expense || new_record? || !expense_account
    true
  end

  def default_liability_account
    @default_liability_account ||= user.liability_account || user.accounts.where(name: "Accounts Payable (A/P)").first
  end

  def default_expense_account
    @user_default ||= user.expense_account || user.accounts.where(name: "Cost of Goods Sold").first
  end

  def set_account_liablility_default
    self.liability_account = default_liability_account
    self.selected_from_default_liability = true
  end

  def set_account_expense_default
    self.expense_account = default_expense_account
    self.selected_from_default_expense = true
  end

  def cancel_accounts_default
    self.selected_from_default_liability = false if liability_account_id_changed? && default_liability_account != liability_account
    self.selected_from_default_expense = false if expense_account_id_changed? && default_expense_account != expense_account
    true
  end

  def recalculate_line_items_default
    line_items.where(selected_from_default_expense: true).update_all(expense_account_id: expense_account_id) if expense_account_id_changed?
    line_items.where(selected_from_default_liability: true).update_all(liability_account_id: liability_account_id) if liability_account_id_changed?
  end

  # TODO: This should go to a worker
  def calculate_invoices_due_dates_if_payment_term_changed
    attrs_changed = [day_of_the_month_changed?, after_recieved_changed?,
                     payment_term_changed?, auto_pay_weekly_changed?,
                     before_due_date_changed?, after_due_date_changed?]
    return true unless attrs_changed.any?
    opts = { "vendor_id" => id, "recalculate_date" => true }
    InvoicesWorker.perform_async(opts)
    true
  end

  def recalculate_invoices_statuses
    return true if valid_vendor? && name.present?
    return true unless VENDOR_BUILDER_ATTRIBUTES.collect {|attr| send("#{attr}_changed?") }.any?
    invoices.where(status: [4,5]).update_all(status: 3)
  end

  def recalculate_invoice_item_hit_creation
    return true unless VENDOR_BUILDER_ATTRIBUTES.collect {|attr| send("#{attr}_changed?") }.any?
    return true unless valid_vendor_fields?
    invoices.each do |invoice|
      next unless invoice.filled_amount_due?
      next unless [invoice.received?, invoice.need_information?].any?
      next if invoice.hits.for_line_item.any?
      invoice.save
    end
  end

  def duplicate_vendor
    return true unless worker? && source_changed?
    new_vendor = self.dup
    new_vendor.id = nil
    new_vendor.parent_id = id
    new_vendor.save
    update_attributes(source: :user)
    true
  end

  def set_qb_d_name
    return true unless name.present?
    return true unless user
    new_name = "#{name} - billSync".truncate(39, omission: "- billSync")
    n = 1
    while user.vendors.where(qb_d_name: new_name).present?
      new_name = "#{name} - billSync #{n}".truncate(39, omission: "- billSync #{n}")
      n += 1
    end
    self.qb_d_name = new_name
    true
  end

  def update_intercom
    return true if Rails.env.test?
    IntercomUpdater.delayed_update(user)
  end

  def set_comparation_string
    self.comparation_string = [name, address1, address2, city, state, zip].join(", ")
    true
  end

  def set_status
    return true unless by_user?
    self.created_by = :by_user
    true
  end
end
