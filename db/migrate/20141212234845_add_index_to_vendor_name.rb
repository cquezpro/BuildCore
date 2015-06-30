class AddIndexToVendorName < ActiveRecord::Migration
  def change
    add_index :vendors, :name, order: { name: :varchar_pattern_ops }
    execute 'ANALYZE vendors;'
  end
end
