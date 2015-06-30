class AddBillPaymentTxnIDToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :bill_payment_txn_id, :string
  end
end
