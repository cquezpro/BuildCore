# Creates an Invoice Moderation for the second review.
class InvoiceModerations::UpdaterSecondReview < InvoiceModerations::UpdaterBase

  validates :vendor_id, presence: true, if: :vendor_status?
  validates :amount_due, presence: true, if: :amount_due_status?
  # validates  :vendor_id, :amount_due, presence: true, if: :both_fields_required? # Declare both_fields_required!

  before_save :set_worker, unless: :worker

  after_commit :try_to_update_invoice

  private

  def try_to_update_invoice
    ModerationsWorker.delay_for(1.minute).perform_async(invoice.id, 'second')
  end
end
