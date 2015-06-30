class RemoveColumnRepayBillFromInvoices < ActiveRecord::Migration
  def change
    remove_column :invoices, :repay_bill
  end
end
