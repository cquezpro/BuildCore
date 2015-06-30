# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :number do
    individual
    sequence(:string) { |n| (1_000_000_000 + n).to_s }
  end
end
