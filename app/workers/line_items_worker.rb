class LineItemsWorker
  include Sidekiq::Worker

  def perform(params)
    return unless hit = Hit.find_by(mt_hit_id: params['mt_hit_id'])
    ::Hits::Review.pay_for(hit.id)

    return unless hit.assignments.count >= 2

    invoice = Invoice.find(params['invoice_id'])
    Mturk::TurkTransactions::Comparator.build_with(invoice, hit).save
  end
end
