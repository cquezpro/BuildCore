class AddRepayBillToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :repay_bill, :boolean, default: false
  end
end
