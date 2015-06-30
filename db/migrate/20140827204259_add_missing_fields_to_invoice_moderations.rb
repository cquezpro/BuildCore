class AddMissingFieldsToInvoiceModerations < ActiveRecord::Migration
  def change
    add_column :invoice_moderations, :name,     :string
    add_column :invoice_moderations, :address1, :string
    add_column :invoice_moderations, :address2, :string
    add_column :invoice_moderations, :city,     :string
    add_column :invoice_moderations, :state,    :string
    add_column :invoice_moderations, :zip,      :string
  end
end
