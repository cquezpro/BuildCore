class AddDefaultClassIDToVendor < ActiveRecord::Migration
  def change
    add_column :vendors, :default_qb_class_id, :integer
  end
end
