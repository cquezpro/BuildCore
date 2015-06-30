class ChangeColumnNumberFromInvoices < ActiveRecord::Migration
  def change
    change_column :invoices, :number, :string
    change_column :invoice_moderations, :number, :string
  end
end
