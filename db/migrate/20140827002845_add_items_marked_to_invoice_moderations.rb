class AddItemsMarkedToInvoiceModerations < ActiveRecord::Migration
  def change
    add_column :invoice_moderations, :items_marked, :boolean, default: false
  end
end
