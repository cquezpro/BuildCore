# Update Invoice fields from the results obtained by the FIRST invoice moderations workers.
class Invoice::AsFirstReview < Invoice

  validates :amount_due, :vendor_id, presence: true # tax and due_date missing here
  validate :valid_vendor

  before_save :set_delivery_date
  after_commit :pay_workers!
  after_commit :set_vendor_status

  private

  def pay_workers!
    invoice_moderations.default.includes(:worker).collect(&:worker).each do |worker|
      ::Workers::Payment.payment_for(worker, hits.first_review.first.reward, true)
    end
    true
  end

  def set_status
    info_complete!
    true
  end

  def valid_vendor
    return unless selected_invoice_moderation && selected_invoice_moderation.vendor_id
    if vendor = Vendor.find(selected_invoice_moderation.vendor_id)
      errors.add(:vendor_id, "invalid vendor") unless vendor.valid_vendor?
    else
      errors.add(:vendor_id, "can't find this vendor")
    end
  end

  def set_vendor_status
    vendor.by_user! unless vendor.by_user?
    true
  end
end
