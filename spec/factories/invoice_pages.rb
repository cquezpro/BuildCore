FactoryGirl.define do
  factory :invoice_page do
    line_items_count 1
    page_number 1
    worker_id 1
    survey_id 1
    invoice
  end

end
