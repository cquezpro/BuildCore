class AddParentIDToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :parent_id, :integer
    add_index :vendors, :parent_id
  end
end
