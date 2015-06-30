class AddSelectedToNumbers < ActiveRecord::Migration
  def change
    add_column :numbers, :selected, :boolean, default: false
    add_column :users, :pay_bills_through_text, :boolean, default: true
  end
end
