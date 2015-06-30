class InvoiceModerations::UpdaterMarkedThrough < InvoiceModerations::UpdaterBase
  after_commit :compare_invoices

  private

  def compare_invoices
    return true unless both_invoice_moderations_submited?(:for_marked_through)
    ModerationsWorker.delay_for(1.minute).perform_async(invoice.id, 'marked_through')
  end

end
