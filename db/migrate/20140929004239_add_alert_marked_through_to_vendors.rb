class AddAlertMarkedThroughToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :alert_marked_through_text, :boolean, default: false
    add_column :vendors, :alert_marked_through_app,  :boolean, default: false
    add_column :vendors, :alert_marked_through_flag, :boolean, default: true
    remove_column :users, :alert_marked_through
  end
end
