class AddFirstBillAddedToUsers < ActiveRecord::Migration
  def change
    add_column :users, :first_bill_added, :boolean, default: false
    add_column :users, :pay_first_bill, :boolean, default: false
  end
end
