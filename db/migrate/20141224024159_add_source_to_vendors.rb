class AddSourceToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :source, :integer, default: 0
  end
end
