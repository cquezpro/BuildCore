class SMSAlertsComposerWorker
  include Sidekiq::Worker

  def perform(individual_id, alert_id, invoice_id)
    invoice = Invoice.find(invoice_id)
    alert = Alert.find(alert_id)
    individual = Individual.find(individual_id)
    TwilioMessages::Alerts::AlertsComposer.new(individual, alert, invoice).send_message!
  end

end
