# Role defines actions which associated Individual can perform.
#
# There are stock and custom roles.  Custom roles are defined by users and
# available only to Individuals of given User.  Stock roles are predefined,
# immutable and available to all Users.
class Role < ActiveRecord::Base
  DEFAULT_ROLE_NAME = "Administrator"

  belongs_to :user, inverse_of: :roles
  has_many :individuals

  scope :stock, proc{ where(user_id: nil) }

  def as_json opts = {}
    opts[:methods] ||= []
    opts[:methods] << :stock
    super(opts)
  end

  def stock?
    user.nil?
  end
  alias_method :stock, :stock?

  def self.default
    stock.where(name: DEFAULT_ROLE_NAME).first
  end
end
