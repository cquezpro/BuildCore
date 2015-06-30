# Updates default invoice moderations from the mechanical turk WORKER on form
# submission.

class InvoiceModerations::UpdaterFirstReview < InvoiceModerations::UpdaterBase

  validates :mt_assignment_id, :mt_hit_id, :mt_worker_id, presence: true

  before_save :set_date
  after_commit :compare_invoices

  private

  def compare_invoices
    return true unless both_invoice_moderations_submited?
    ModerationsWorker.delay_for(1.minute).perform_async(invoice.id)
    true
  end

  def set_date
    return true if date.present?
    self.date = invoice.created_at
    true
  end
end
