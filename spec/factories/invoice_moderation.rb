FactoryGirl.define do
  factory :invoice_moderation do
    invoice

    sequence(:name)           { |n| "Vendor name: #{n}" }
    amount_due               123
    due_date                  Date.today
    number                    "123456789"

    address1                  "Some address"
    state                      "NY"
    zip                       4000
    city                      "New York"
  end

  factory :im_first_review, class: InvoiceModerations::UpdaterFirstReview do
    invoice
    worker

    sequence(:name)           { |n| "Vendor name: #{n}" }
    amount_due               123
    due_date                  Date.today
    number                    "123456789"
    address1                  "Some address"
    state                      "NY"
    zip                       4000
    city                      "New York"
    other_fee                  "12345"

    sequence(:mt_assignment_id) {|n| "mt_assignment_id_#{n}" }
    sequence(:mt_hit_id)        {|n| "mt_hit_id_#{n}" }
    sequence(:mt_worker_id)     {|n| "mt_worker_id_#{n}" }
  end

  factory :im_second_review, class: InvoiceModerations::UpdaterSecondReview do
    invoice
    worker

    sequence(:name)           { |n| "Vendor name: #{n}" }
    amount_due               123
    due_date                  Date.today
    number                    "123456789"
    moderation_type           1
    address1                  "Some address"
    state                      "NY"
    zip                       4000
    city                      "New York"


    sequence(:mt_assignment_id) {|n| "mt_assignment_id_#{n}" }
    sequence(:mt_hit_id)        {|n| "mt_hit_id_#{n}" }
    sequence(:mt_worker_id)     {|n| "mt_worker_id_#{n}" }

    hit_id { create(:hit).id }
  end
end
