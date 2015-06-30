class ModerationsWorker
  include Sidekiq::Worker

  def perform(invoice_id, comparation_type = 'first')
    return unless invoice = Invoice.find(invoice_id)
    case comparation_type
    when 'first'
      InvoiceModerations::FirstReviewComparator.build_from(invoice).run!
    when 'second'
      InvoiceModerations::SecondReviewComparator.build_from(invoice).run!
    when 'marked_through'
      InvoiceModerations::MarkedThroughComparator.build_from(invoice).run!
    end
  end
end
