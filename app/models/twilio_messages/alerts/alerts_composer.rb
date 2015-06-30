class TwilioMessages::Alerts::AlertsComposer
  include TwilioMessages::TwilioClient

  attr_reader :recipient, :alert, :invoice

  delegate :number, :to => :recipient, :prefix => :recipient

  def initialize(recipient, alert, invoice)
    @recipient = recipient
    @alert = alert
    @invoice = invoice
  end

  def send_message!
    message = %{#{alert.sms_text}. to stop receiving this alert reply, "s" for stop}
    twilio_client.account.messages.create(:from => SERVER_NUMBER, :to => recipient_number, :body => message)
    create_alert_sms_message
  rescue Twilio::REST::RequestError => e
    puts e
  end

  private

  def create_alert_sms_message
    SmsMessage.create({number: recipient_number, text: alert.sms_text, message_type: 1, alert: alert})
  end
end
