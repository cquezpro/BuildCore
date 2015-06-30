class ChangeFlagInAppFieldsFromVendors < ActiveRecord::Migration
  def change
    change_column :vendors, :alert_total_flag, :boolean, default: true
    change_column :vendors, :alert_itemqty_flag, :boolean, default: true
    change_column :vendors, :alert_itemprice_flag, :boolean, default: true
    change_column :vendors, :alert_item_flag, :boolean, default: true
  end
end
