require 'twilio-ruby'

class TwilioMessages::Invoices::SmsReplier
  attr_reader :response_type, :invoice, :to

  def initialize(response_type, to, invoice = nil)
    @response_type = response_type
    @invoice = invoice
    @to = to
  end

  def respond!
    case response_type
    when :invalid_number
      invalid_number_response
    when :first_image
      first_image_response
    when :single
      single_response
    when :multiple
      multiple_response
    when :done
      done_response
    when :deleted
      deleted_response
    when :invalid
      invalid_response
    when :start_multiple
      start_multiple_response
    when :already_on_multiple
      already_on_multiple_response
    when :not_multiple_mode_detected
      not_multiple_mode_detected_response
    end
  end

  def client
    @client ||= Twilio::REST::Client.new "AC3997f2d1178ff89bbd69dd2c476f6e0a", "8e940bcb768c3b95ffe44839586b5559"
  end

  def first_image_response
    Rails.logger.debug ">>>>>> Render first_image_response"
    puts ">>>>>> Render first_image_response"
    respond_with(%{Just got your last invoice! If there are multiple pages to this invoice please text 'm' and then start texting the other pages. Once you are done text 'd'. To undo the last image type 'u'. If your invoice is just a SINGLE page just text in your next invoice without doing anything else.})
  end

  def single_response
    Rails.logger.debug ">>>>>> Render single_response"
    puts ">>>>>> Render single_response"
    respond_with("Got it, feel free to send another!")
  end

  def done_response
    Rails.logger.debug ">>>>>> Render done_response"
    puts ">>>>>> Render done_response"
    respond_with("Got it, we'll start working on it!")
  end

  def invalid_response
    Rails.logger.debug ">>>>>> Render invalid_response"
    puts ">>>>>> Render invalid_response"
    respond_with("Sorry we didn't recognize this as an invoice or command")
  end

  def deleted_response
    Rails.logger.debug ">>>>>> Render deleted_response"
    puts ">>>>>> Render deleted_response"
    respond_with('Last Page deleted')
  end

  def start_multiple_response
    Rails.logger.debug ">>>>>> Render start_multiple_response"
    puts ">>>>>> Render start_multiple_response"
    respond_with("You are now in multi page mode, after you send the last page of the invoice type 'd' and we will get to processing it")
  end

  def multiple_response
    respond_with("Got it, that is #{invoice.uploads.count.ordinalize} page, type 'd' to exit multipage mode")
  end

  def already_on_multiple_response
    respond_with("You are already on multiple mode!.")
  end

  def not_multiple_mode_detected_response
    respond_with("We can't find your last invoice. Try sending 'm' to start a multiple invoice page.")
  end

  def respond_with(message_body)
    twiml = Twilio::TwiML::Response.new do |r|
      r.Message message_body
    end
    twiml.text
  end

  def invalid_number_response
    Rails.logger.debug ">>>>>> Render invalid_number_response"
    puts ">>>>>> Render invalid_number_response"
    respond_with("We can't find an account associated with your number. Please login into the dashboard and add your number under the profile tab")
  end

  # def respond_with(message_body)
  #   return if ["+19177461141", "19177461141"].include?(to)
  #   client.account.messages.create(:from => '+19177461141',:to => to, :body => message_body)
  # end

end
