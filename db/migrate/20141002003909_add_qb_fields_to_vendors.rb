class AddQBFieldsToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :sync_token, :integer
    add_column :vendors, :qb_id, :integer
    add_column :vendors, :qb_account_number, :string
  end
end
