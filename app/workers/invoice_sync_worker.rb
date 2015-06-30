class InvoiceSyncWorker
  include Sidekiq::Worker

  def perform(invoices_id)
    if invoices_id.is_a? Integer
      QuickbooksSync::Invoices::Bill.find(invoices_id).sync!
    else
      invoices_id.each do |id|
        QuickbooksSync::Invoices::Bill.find(id).sync!
      end
    end
  end
end
