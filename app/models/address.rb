class Address < ActiveRecord::Base
  INVALID_ID = "NOT_LISTED"

  belongs_to :user
  belongs_to :addressable, polymorphic: true
  belongs_to :parent, class_name: 'Address', foreign_key: :parent_id
  belongs_to :qb_class
  has_many :childrens, class_name: 'Address', foreign_key: :parent_id
  has_many :invoices

  before_create :set_default_class

  enum created_by: [:by_user, :by_worker]

  COMPARATION_FIELDS = [:name, :address1, :address2, :city, :state, :zip]

  def valid_address?
    [name].all?(&:present?)
  end

  def formated_address
    [name, address1, address2, city, state, zip].compact.join(', ')
  end

  def formated_address_with_id
    {id: id, string: formated_address }
  end

  def merge_address!(parent_id)
    update_attributes(parent_id: parent_id)
  end

  def unmerge_address!
    update_attributes(parent_id: nil)
  end

  def set_default_class
    return true unless user
    self.qb_class = user.default_class
    true
  end
end
