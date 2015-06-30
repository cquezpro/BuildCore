class AddRelationAccountsToUser < ActiveRecord::Migration
  def change
    add_column :users, :liability_account_id, :integer
    add_column :users, :expense_account_id, :integer

    add_column :vendors, :liability_account_id, :integer
    add_column :vendors, :expense_account_id, :integer

    add_column :line_items, :liability_account_id, :integer
    add_column :line_items, :expense_account_id, :integer
  end
end
