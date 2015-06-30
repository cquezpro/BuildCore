class InvoiceModeration < ActiveRecord::Base
  belongs_to :worker
  belongs_to :assignment
  belongs_to :invoice
  belongs_to :hit
  has_many :responses, as: :trackable

  FIELDS = [:amount_due, :vendor_id, :tax, :due_date, :number, :other_fee, :date]

  enum status: [:not_submited, :submited]
  enum moderation_type: [:default, :for_second_review, :for_marked_through]
  enum items_marked: {
    not_marked: 0,
    marked: 1
  }

  scope :second_review,-> { where(moderation_type: 1) }

  accepts_nested_attributes_for :worker

  normalize_attribute :amount_due, :vendor_id, :tax, :due_date,
                      :number, :account_number, :other_fee, with: [:squish, :blank]

  def self.not_most_recent
    order('created_at ASC').submited
  end

  def self.not_submited_hits(hit_id)
    where(hit_id: hit_id).not_submited.first
  end

  def self.submited_hits(hit_id)
    where(hit_id: hit_id).submited
  end

  def self.get_invoices(hits)
    where(hit_id: hits).includes(:invoice).collect(&:invoice).uniq
  end

  def self.by_one(scope = :default)
    if count == 3
      includes(invoice: [:uploads]).not_submited.send(scope)
    else
      includes(invoice: [:uploads]).not_submited.send(scope).to_a.uniq(&:invoice_id)
    end
  end

  alias_method :original_invoice, :invoice

  # Vendors name
  def selected
    @selected ||= Vendor.find_by(id: vendor_id).try(:name) if vendor_id
  end

  def pdf_url
    invoice.try(:pdf_url)
  end

  def attributes_for_invoice
    {
      amount_due:     amount_due,
      vendor_id:      vendor_id,
      tax:            tax,
      due_date:       due_date,
      number:         number,
      account_number: account_number,
      other_fee: other_fee
    }
  end

  def sibling_record(scope = :default)
    @sibling_record ||= invoice.invoice_moderations.send(scope).order('created_at asc').where.not(id: id).first
  end
end
