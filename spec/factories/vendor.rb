FactoryGirl.define do
  factory :vendor do
    user

    sequence(:name)  { |n| "Vendor name: #{n}" }
    address1         "Some addres 123"
    city             "New York"
    state            "NY"
    zip               4000
    routing_number   "011000015" # FED
    bank_account_number "123456789"
  end
end
