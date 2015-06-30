class RemoveFieldsFromInvoiceModerations < ActiveRecord::Migration
  def change
    remove_column :invoice_moderations, :line_items_quantity
    remove_column :invoice_moderations, :items_marked
    remove_column :invoice_moderations, :routing_number
    remove_column :invoice_moderations, :bank_account_number
    remove_column :invoice_moderations, :unit_price
    remove_column :invoice_moderations, :line_item_quantity
    remove_column :invoice_moderations, :new_item
    remove_column :invoice_moderations, :invoice_total
    remove_column :invoice_moderations, :delivery_zip
    remove_column :invoice_moderations, :delivery_state
    remove_column :invoice_moderations, :delivery_city
    remove_column :invoice_moderations, :delivery_address3
    remove_column :invoice_moderations, :delivery_address2
    remove_column :invoice_moderations, :delivery_address1
    remove_column :invoice_moderations, :account_number
    remove_column :invoice_moderations, :resale_number
    remove_column :invoice_moderations, :act_by
  end
end
