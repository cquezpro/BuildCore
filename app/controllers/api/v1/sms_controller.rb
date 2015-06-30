class Api::V1::SmsController < Api::V1::CoreController
  skip_before_action :authenticate_individual!

  def incoming
    response.headers["Content-Type"] = "text/xml"
    response = TwilioMessages::MessageParser.new(params).run!
    if response
      render xml: response
    else
      head 200
    end
  end

end
