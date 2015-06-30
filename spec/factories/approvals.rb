# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :approval do
    invoice
    association :approver, factory: :individual
    approved_at "2014-12-08 12:48:11"
  end
end
