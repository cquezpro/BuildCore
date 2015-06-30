class RemoveValidInvoicesFromInvoices < ActiveRecord::Migration
  def change
    remove_column :invoices, :valid_invoice
  end
end
