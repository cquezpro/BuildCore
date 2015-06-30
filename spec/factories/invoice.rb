FactoryGirl.define do
  factory :invoice do
    vendor
    user
    number "12345"
    sequence(:txn_id) {|e| "txn_#{e}" }
    sync_qb false
    date Date.today

    trait :without_vendor do
      vendor nil
    end

    # Following traits may easily get broken when state machine changes.
    # State machine is able to update Invoice#status without warning when
    # attribute criteria do not fit requested state.

    trait :need_information do
      status :need_information
      amount_due nil
    end

    trait :ready_for_payment do
      status :ready_for_payment
      amount_due 10.00
    end

    trait :in_process do
      status :in_process
    end
  end
end
