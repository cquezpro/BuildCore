class AddValidityFieldToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :valid_invoice, :boolean, default: false
  end
end
