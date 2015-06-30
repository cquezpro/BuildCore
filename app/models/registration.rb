class Registration < Individual
  USER_ATTRIBUTES = %w[timezone business_name terms_of_service]

  delegate *USER_ATTRIBUTES.map{ |a| [a, "#{a}="] }.flatten, :to => :user

  validates :name, :business_name, :mobile_phone, :email, :timezone, presence: true
  validates :terms_of_service, acceptance: { accept: true }

  validate :validate_number

  def mobile_phone= value
    number.string = value
  end

  def mobile_phone
    number.string
  end

  # after_initialize is triggered too late
  def user
    super or build_user
  end

  # after_initialize is triggered too late
  def number
    super or build_number
  end

  def validate_number
    number.valid? or errors[:mobile_phone].concat number.errors[:string]
  end
end
