Airbrake.configure do |config|
  config.api_key = '7542586e197734fdc0445e384b101038'
  config.host    = 'billsync-errbit.herokuapp.com'
  config.port    = 443
  config.secure  = config.port == 443
end
