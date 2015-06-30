class Api::V1::VendorTypeaheadSerializer < Api::V1::CoreSerializer
  attributes :id
  attributes :name
  attributes :address1
  attributes :address2
  attributes :city
  attributes :state
  attributes :zip
  attributes :bank_account_number
  attributes :routing_number
end
