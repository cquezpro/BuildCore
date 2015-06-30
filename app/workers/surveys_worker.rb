class SurveysWorker
  include Sidekiq::Worker

  def perform(params)
    invoice = Invoice.find(params['invoice_id'])
    Mturk::Surveys::Comparator.new(invoice).run!
  end
end
