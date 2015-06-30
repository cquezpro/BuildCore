class Survey < ActiveRecord::Base
  COMPARATION_FIELDS = [
    :is_invoice, :vendor_present, :address_present, :amount_due_present,
    :is_marked_through
  ]

  belongs_to :invoice
  belongs_to :worker
  belongs_to :assignment
  has_many :invoice_pages
  has_many :responses, as: :trackable

  accepts_nested_attributes_for :invoice_pages

end
