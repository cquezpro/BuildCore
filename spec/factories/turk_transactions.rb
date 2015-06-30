FactoryGirl.define do
  factory :turk_transaction do
    code "MyString"
    sequence(:description) {|e| "MyString #{e}" }
    quantity "9.99"
    price ""
    discount "9.99"
    total "9.99"
    worker
    assignment_id 1
    hit_id 1
    invoice
  end

end
