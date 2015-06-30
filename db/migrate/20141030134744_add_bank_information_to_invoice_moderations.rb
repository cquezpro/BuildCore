class AddBankInformationToInvoiceModerations < ActiveRecord::Migration
  def change
    add_column :invoice_moderations, :routing_number, :string
    add_column :invoice_moderations, :bank_account_number, :string
  end
end
