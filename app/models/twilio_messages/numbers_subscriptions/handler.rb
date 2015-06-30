class TwilioMessages::NumbersSubscriptions::Handler
  include TwilioMessages::TwilioClient
  attr_reader :params, :number, :body

  def initialize(params, number)
    @params = params
    @number = number
    @body = params[:Body].try(:downcase)
  end

  def remove?
    body == 'remove'
  end

  def confirm?
    body == 'yes' || body == 'y'
  end

  def reject?
    body == 'no' || body == 'n'
  end

  def run!
    case
    when remove?
      thread = create_thread
      sms = build_initial_message
      thread.sms_messages << sms
      twilio_response(sms.text)
    when confirm?
      last_thread.locked!
      user = number.user
      number.destroy
      twilio_response("You have been removed from #{user.business_name} account.")
    when reject?
      last_thread.locked
      twilio_response("You are still enrolled to #{user.business_name} account.")
    end
  end

  private

  def create_thread
    SmsThread.create({thread_type: :unsubscribe, user: number.user, number: number})
  end

  def build_initial_message
    SmsMessage.new({number: number, text: "Are you sure you want to remove yourself from #{number.user.business_name} account? (y/n)"})
  end

  def last_thread
    number.last_thread(:unsubscribe)
  end

end
