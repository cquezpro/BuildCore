class IntercomUpdater
  ALLOWED_TYPES = [User, Individual]

  private_class_method :new

  def self.update object
    new(object).run
  end

  def self.delayed_update object
    delay_for(5.seconds).perform_delayed_update self.object_to_hash(object)
  end

  def self.perform_delayed_update hash
    self.update self.object_from_hash(hash)
  end

  def run
    case @object
    when User then update_company @object
    when Individual then update_individual @object
    end
  end

  private

  def initialize object
    @object = object
  end

  def self.object_to_hash object
    {type: object.class.name, id: object.id}
  end

  def self.object_from_hash hash
    object_type = hash[:type].safe_constantize

    if ALLOWED_TYPES.any?{ |t| t.in? object_type.ancestors }
      object_type.find hash[:id]
    else
      raise "Unsupported type #{hash[:type]}"
    end
  end

  def update_company company
    Intercom::Company.create(
      name: company.business_name,
      company_id: company.id,
      remote_created_at: timestamp(company.created_at),
      custom_attributes: {
        "Invoices uploaded" => company.invoices.count,
        "Invoices which need information" => company.invoices.need_information.count,
        "Invoices ready for payment" => company.invoices.ready_for_payment.count,
        "Invoices payment queue length" => company.invoices.payment_queue.count,
        "Last bill uploaded" => timestamp(company.invoices.order(created_at: :desc).first.try(:created_at)),
        "Total alerts" => company.number_of_alerts,
        "Number of vendors on autopay" => company.number_of_vendors_on_autopay,
        "Number of users added" => company.number_of_users_added,
        "Connected to quickbooks" => company.intuit_authentication?,
        "Verified user" => company.email_confirmed?,
        "Invoices proccesed by Turk" => company.invoices_proccesed_by_turk.count,
        "Most used vendor" => company.most_used_vendor.try(:name),
        "Day before first check sent" => timestamp(company.date_before_check_sent),
      },
    )
  end

  def update_individual individual
    return if Rails.env.test?
    Intercom::User.create(
      user_id: individual.id,
      name: individual.name,
      email: individual.email,
      signed_up_at: timestamp(individual.created_at),
      companies: [
        {company_id: individual.user.id},
      ],
      custom_attributes: {
        "Sign in count" => individual.sign_in_count,
        "Last login" => timestamp(individual.last_sign_in_at),
        "Registration link" => individual.registration_link,
      },
    )
  end

  def timestamp src
    src.nil? ? nil : src.to_time.to_i
  end
end
