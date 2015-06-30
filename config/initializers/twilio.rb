require 'twilio-ruby'

Twilio.configure do |config|
  config.account_sid = [Rails.env.test?, Rails.env.development?].any? ? 'ACf6a1e33503756f475da3e1bcdd4e006b' : "ACb5b2e3c86abc5169e0c962857a26b298"
  config.auth_token = [Rails.env.test?, Rails.env.development?].any? ? 'c3af30579bcf12cfa79230fd9bbdc574' : "6488ed8d579619d61a266bf738485224"
end
