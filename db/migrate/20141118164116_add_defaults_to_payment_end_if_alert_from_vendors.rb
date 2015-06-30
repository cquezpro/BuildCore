class AddDefaultsToPaymentEndIfAlertFromVendors < ActiveRecord::Migration
  def change
    change_column :vendors, :payment_end_if_alert, :boolean, default: true
  end
end
