class AddCreatedByToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :created_by, :integer, default: 0
  end
end
