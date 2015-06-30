class ChangeVendorRoutingAndBankAccountNumberTypes < ActiveRecord::Migration
  def change
  	change_column :vendors, :routing_number,  :string
  	change_column :vendors, :bank_account_number,  :string
  end
end
