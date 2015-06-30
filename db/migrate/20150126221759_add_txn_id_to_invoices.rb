class AddTxnIDToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :txn_id, :string
    add_column :invoices, :synced_payment, :boolean, default: false
  end
end
