class VendorAlertSettings < ActiveRecord::Base
  belongs_to :individual, inverse_of: :vendor_alert_settings
  belongs_to :vendor

  TOGGLE_RX = /\Aalert_.*_(email|text|flag)\Z/
  TOGGLES = attribute_names.grep TOGGLE_RX

  scope :for_vendor, lambda { |vendor| where(vendor_id: vendor) }
end
