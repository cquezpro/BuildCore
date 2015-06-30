class RemoveColumnAutoPayWeeklyActiveFromVendors < ActiveRecord::Migration
  def change
    remove_column :vendors, :auto_pay_weekly_active
  end
end
