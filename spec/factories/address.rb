FactoryGirl.define do
  factory :address do

    sequence(:name) { |n| "Name-#{n}" }
    sequence(:address1) { |n| "Address-1- #{n}" }
    zip "SOME Zip"
    city "Some city"
    state "Some state"
    created_by :by_user
    association :addressable, factory: :invoice
  end
end
