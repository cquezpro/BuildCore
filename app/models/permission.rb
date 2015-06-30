# Describes authorization permissions.
#
# All instances are predefined.  Generating new ones in the runtime is
# not intended.
#
# Retrieve existing permissions with [] operator as in:
#
#     key = %w[manage all]
#     Permission[key] #=> Permission instance or +nil+
class Permission

  private_class_method :new

  attr_reader :action, :subject

  def initialize action, subject
    @action = action
    @subject = subject
  end

  def key
    "#{action}-#{subject}"
  end

  def self.[] array
    ALL[array]
  end

  RAW = [
    [:read, Invoice],
    [:manage, Invoice],
    [:manage, Alert],
    [:read, Vendor],
    [:manage, Vendor],
    [:read, :today],
    [:manage, :approval],
    [:read, :approval],
    [:update_when_approving, Invoice],
    [:regular_approve, Invoice],
    [:update, Invoice],
    [:read, Payment],
    [:record, Payment],
    [:read, Account],
    [:pay_approved, Payment],
    [:cru, Account],
    [:pay_unapproved, Payment],
    [:pay_unassigned, Payment],
    [:read, User],
    [:update, User],
    [:read, Role],
    [:manage, Role],
    [:read, Individual],
    [:cru, Individual],
    [:read_accounting, Vendor],
    [:manage_accounting, Vendor],
    [:read_terms, Vendor],
    [:manage_terms, Vendor],
    [:synchronize, :all],
    [:read_incomplete, Invoice],
    [:text, Invoice],
    [:email, Invoice],
    [:accountant_approve, Invoice],
    [:update_password, :himself],
    [:verify, User],
    [:authorized, :payment]
  ].to_set

  ALL = RAW.inject({}) do |acc, arr|
    perm = new *arr
    acc[perm.key] = perm
    acc
  end

end
