class AddKeepDueDateToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :keep_due_date, :boolean, default: false
  end
end
