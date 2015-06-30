FactoryGirl.define do
  factory :line_item do
    vendor

    sequence(:price) { |n| "2.2#{n}".to_f }
    code "some code"
    sequence(:description) { |n| "description #{n}"}

  end
end
