FactoryGirl.define do
  factory :individual do
    sequence(:email) {|n| "email-#{n}@example.test" }
    password "asdasdasd"
    password_confirmation{ password }
    terms_of_service true

    trait :with_number do
      number
    end
  end

  factory :registration do
    sequence(:email) {|n| "registration-#{n}@example.test" }
    sequence(:mobile_phone) { |n| (100_000_0000 + n).to_s }
    name "Mr Bill Sync"
    business_name "Bill-o-Sync"
    password "asdasdasd"
    password_confirmation{ password }
    timezone "Europe/Berlin"
    terms_of_service true
  end
end
