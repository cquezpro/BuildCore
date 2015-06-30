# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :role do
    user nil
    name "MyString"
    permissions "MyText"
  end
end
