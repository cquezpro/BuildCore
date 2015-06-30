class AddAddressIDToInvoice < ActiveRecord::Migration
  def change
    add_column :invoices, :address_id, :integer
    add_column :addresses, :user_id, :integer
  end
end
