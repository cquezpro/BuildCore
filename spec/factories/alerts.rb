# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :alert do
    association :invoice_owner, factory: :invoice

    # Category traits

    trait :invoice_increase_total do
      category :invoice_increase_total
      association :invoice_owner, factory: :invoice, amount_due: 10.0
      on_invoice_owner
      with_average
    end

    trait :new_line_item do
      category :new_line_item
      on_invoice_transaction
    end

    trait :line_item_quantity do
      category :line_item_quantity
      on_invoice_transaction
      with_average
    end

    trait :line_item_price_increase do
      category :line_item_price_increase
      on_invoice_transaction
      with_average
    end

    trait :new_vendor do
      category :new_vendor
    end

    trait :duplicate_invoice do
      category :duplicate_invoice
      on_duplicate_invoice # not true duplicate
    end

    trait :manual_adjustment do
      category :manual_adjustment
      on_invoice_owner
    end

    trait :resending_payment do
      category :resending_payment
    end

    trait :no_location do
      category :no_location
    end

    trait :processing_items do
      category :processing_items
    end

    # Attribute traits

    trait :on_invoice_transaction do
      association :alertable, factory: :invoice_transaction
    end

    trait :on_duplicate_invoice do
      association :alertable, factory: :invoice # TODO true duplicate
    end

    trait :on_invoice_owner do
      alertable { invoice_owner }
    end

    trait :with_average do
      average 5.0
    end
  end

  factory :alert_creator, parent: :alert, class: Alerts::AlertCreator
end
