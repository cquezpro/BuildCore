class AddQBDNameToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :qb_d_name, :string, limit: 41
  end
end
