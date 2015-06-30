class Api::V1::UserSerializer < Api::V1::CoreSerializer
  attributes :id

  has_many :numbers
  has_many :qb_classes

  attributes :invite_code, :mobile_phone, :routing_number,
      :bank_account_number, :created_at, :updated_at,
      :default_due_date, :timezone, :business_name, :business_type,
      :billing_address1, :billing_address2, :billing_city, :billing_state,
      :billing_zip, :qb_token, :qb_secret, :realm_id, :token_expires_at,
      :reconnect_token_at, :check_number, :liability_account_id,
      :expense_account_id, :terms_of_service, :bank_account_id, :sms_time,
      :pay_bills_through_text, :date_before_check_sent, :first_bill_added,
      :pay_first_bill, :modal_used, :locations_feature, :default_class_id,
      :valid_user, :has_mobile_number, :has_email, :has_bills,
      :confirmed_email, :has_autopay, :intuit_authentication,
      :liability_accounts, :expense_accounts, :bank_accounts, :all_addresses,
      :synced_qb, :signature, :qb_company_name, :last_qb_sync, :qb_wrong_company,
      :verified, :bank_information_filled, :verification_status, :doing_business_as,
      :ach_date, :humanized_verification_status

  def has_email
    object.individuals.size > 1
  end

  def has_bills
    object.invoices.any?
  end

  def has_mobile_number
    object.numbers.any?
  end

  def confirmed_email
    object.email_confirmed?
  end

  def has_autopay
    object.vendors.autopay.any?
  end

  def verified
    object.verified? && object.valid_for_payments?
  end

  def bank_information_filled
    [object.bank_account_number, object.routing_number].all?(&:present?)
  end

  def humanized_verification_status
    case
    when verified
      "Verified"
    when object.in_process?
      "In Process"
    when object.not_verified?
      "Not verified"
    end
  end
end
