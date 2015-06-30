# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :survey do
    invoice
    worker

    is_invoice [true, false].sample
    vendor_present [true, false].sample
    address_present [true, false].sample
    amount_due_present [true, false].sample
    is_marked_through [true, false].sample
    sequence(:address_reference) { |n| "#{n}"}

    trait :all_trues do
      is_invoice true
      vendor_present true
      address_present true
      amount_due_present true
      is_marked_through true
    end
  end
end
