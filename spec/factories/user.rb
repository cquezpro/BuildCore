FactoryGirl.define do
  factory :user do
    locations_feature true
    routing_number      "011000015" # FED
    bank_account_number "123456789000"

    trait :connected_to_qb do
      qb_token "abc123"
      qb_secret "abc123"
    end
  end
end
