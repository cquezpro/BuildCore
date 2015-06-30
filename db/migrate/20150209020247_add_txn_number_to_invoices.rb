class AddTxnNumberToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :txn_number, :integer
  end
end
