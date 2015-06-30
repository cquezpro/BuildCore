# Update Invoice from second invoice moderation Review.
class Invoice::AsSecondReview < Invoice
  attr_accessor :input_type, :worker_im, :im_for_update

  validates :input_type, :im_for_update, presence: true
  validates :vendor_id, presence: true, if: :for_vendor?
  validates :amount_due, presence: true, if: :for_amount?

  before_validation :pick_im_by_worker_score
  before_validation :update_field_from_im_for_update
  before_save :set_delivery_date
  before_update :set_fields_from_invoice_moderation

  after_update :pay_workers!
  after_update :clear_hit!

  after_commit :set_vendor_status

  def self.update_with(invoice_moderation, input_type)
    builder = find(invoice_moderation.invoice.id)
    builder.im_for_update = invoice_moderation
    builder.input_type = input_type
    builder.save
  end

  private

  def for_vendor?
    input_type == :vendor_id
  end

  def for_amount?
    input_type == :amount_due
  end

  def update_field_from_im_for_update
    if for_vendor? && !vendor_id.present?
      vd = Vendor.find(im_for_update.vendor_id)
      self.vendor_id = vd.parent_id ? vd.parent_id : vd.id
    elsif for_amount? && !amount_due.present?
      self.amount_due = im_for_update.amount_due unless has_marked_through_hit?
    end
  end

  def pay_workers!
    hits.each do |hit|
      ::Workers::Payment.payment_for(@selected_worker, hit.reward, true)
      ::Workers::Payment.payment_for(im_for_update.worker, hit.reward, true)
    end
    true
  end

  def clear_hit!
    if new_hit_id = invoice_moderations.second_review.first.try(:hit_id)
      ::Hits::Review.complete!(new_hit_id)
    end
    true
  end

  def pick_im_by_worker_score
    @selected_worker = ::Workers::Comparator.build_with_invoice_moderation(invoice_moderations).comparate_by_score
    @selected_invoice_moderation = invoice_moderations.find_by(worker_id: @selected_worker.id)
  end

  def set_status
    begin
      info_complete!
    rescue
    end
    true
  end

  def set_vendor_status
    vendor.by_user! unless vendor.by_user?
    true
  end
end
