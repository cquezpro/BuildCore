class AddressWorker
  include Sidekiq::Worker

  def perform(invoice_id)
    return true unless invoice = Invoice.find(invoice_id)
    ::Mturk::Addresses::Comparator.new(invoice).run!
  end
end
