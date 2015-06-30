class AddUpdateOnQuickbooksToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :update_to_quickbooks, :boolean, default: false
  end
end
