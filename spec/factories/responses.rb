FactoryGirl.define do
  factory :response do
    worker
    trackable_id 1
    trackable_type "MyString"
    status 1
  end

end
