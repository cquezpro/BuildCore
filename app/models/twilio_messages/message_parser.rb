class TwilioMessages::MessageParser
  include TwilioMessages::TwilioClient

  attr_accessor :params

  def initialize(params)
    @params = params
  end

  def run!
    return invalid_number_response unless number
    return number_not_allowed unless can_text_invoice?
    return number_not_allowed_to_pay unless can_pay?
    if params[:Body].try(:downcase) == 'remove' || number.last_thread && number.last_thread.unsubscribe?
      TwilioMessages::NumbersSubscriptions::Handler.new(params, number).run!
    elsif number.sms_messages.last && number.sms_messages.last.alert_type?
      number.disable_alert if params["Body"].try(:downcase) == 's'
      twilio_response("Got it, will stop sending!")
    elsif last_thread_payment?
      TwilioMessages::Payments::Handler.new(params, number).run!
    else
      TwilioMessages::Invoices::Creator.read_from(params, number).run!
    end
  end

  def number
    @number ||= Number.find_by(string: params["From"])
  end

  def numbers
    @numbers || number.individual.user.numbers
  end

  def last_thread_payment?
    numbers.collect(&:last_thread).compact.any?(&:payment?)
  end

  def user
    @user ||= number.try(:user)
  end

  def invalid_number_response
    Rails.logger.debug ">>>>>> Render invalid_number_response"
    puts ">>>>>> Render invalid_number_response"
    twilio_response("We can't find an account associated with your number. Please login into the dashboard and add your number under the profile tab")
  end

  private

  def can_pay?
    number.individual.permissions.include?("pay_approved-Payment")
  end

  def can_text_invoice?
    number.individual.permissions.include?("text-Invoice")
  end

  def number_not_allowed
    twilio_response("This number is not allowed to create invoices via text.")
  end

  def number_not_allowed_to_pay
    twilio_response("This number is not allowed to pay invoices via text.")
  end


end
