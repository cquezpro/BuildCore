class AddBankNameToInvoice < ActiveRecord::Migration
  def change
    add_column :invoices, :bank_name, :string
  end
end
