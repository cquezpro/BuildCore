class AddAutoPayWeeklyToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :auto_pay_weekly, :integer, default: 1
    add_column :vendors, :auto_pay_weekly_active, :boolean
  end
end
