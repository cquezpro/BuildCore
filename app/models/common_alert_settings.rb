class CommonAlertSettings < ActiveRecord::Base
  belongs_to :individual, inverse_of: :common_alert_settings

  TOGGLE_RX = /\A(email|text)_.*_(onchange|daily|weekly|none)\Z/
  TOGGLES = attribute_names.grep TOGGLE_RX
end
