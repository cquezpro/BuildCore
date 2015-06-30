class AddPaymentEndIfAlertToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :payment_end_if_alert, :boolean
  end
end
