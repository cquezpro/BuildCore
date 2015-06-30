class AddPaymentStatusToVendor < ActiveRecord::Migration
  def change
    add_column :vendors, :payment_status, :integer, default: 0
    change_column :vendors, :after_due_date, :integer, default: 1
    change_column :vendors, :before_due_date, :integer, default: 1
  end
end
