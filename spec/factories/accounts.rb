# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :account do
    user
  end

  factory :expense_account, parent: :account do
    classification "Expense"
  end
end
