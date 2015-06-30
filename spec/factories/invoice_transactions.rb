FactoryGirl.define do
  factory :invoice_transaction do
    line_item
    invoice
    quantity 1
    total 9.99
    price 9.99
    discount 9.99
    qb_id 1
    sync_token 1
    average_price 9.99
    average_volume 9.99
    txn_line_id "MyString"
    order_number 1
  end

end
