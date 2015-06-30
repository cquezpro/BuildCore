class AddStatusToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :status, :integer, default: 0
  end
end
