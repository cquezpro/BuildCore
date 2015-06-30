if Rails.env.production? || Rails.env.staging? || Rails.env.development?
  Figaro.require_keys "TWILIO_SID", "TWILIO_TOKEN"
end

module TwilioMessages
  module TwilioClient
    extend ActiveSupport::Concern

    def twilio_client
      @twilio_client ||= Twilio::REST::Client.new ENV["TWILIO_SID"], ENV["TWILIO_TOKEN"]
    end

    def twilio_response(message_body)
      twiml = Twilio::TwiML::Response.new do |r|
        r.Message message_body
      end
      Rails.logger.debug ">>>>>> Render #{twiml.text}"
      puts ">>>>>> Render #{twiml.text}"
      twiml.text
    end

  end
end
