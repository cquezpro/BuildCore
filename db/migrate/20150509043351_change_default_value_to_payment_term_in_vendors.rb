class ChangeDefaultValueToPaymentTermInVendors < ActiveRecord::Migration
  def change
    change_column :vendors, :payment_term, :integer, default: 1
  end
end
