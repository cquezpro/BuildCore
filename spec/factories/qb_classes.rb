# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :qb_class do
    user
    sequence(:qb_id) { |n| n }
    sync_token 0
    metadata nil
    sub_class false
    qb_parent_id nil
    name "Location"
    fully_qualified_name "Some Defined Location"
    active true
  end
end
