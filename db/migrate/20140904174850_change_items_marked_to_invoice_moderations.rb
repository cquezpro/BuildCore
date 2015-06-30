class ChangeItemsMarkedToInvoiceModerations < ActiveRecord::Migration
  def change
    remove_column :invoice_moderations, :items_marked
    remove_column :invoice_moderations, :line_items_quantity

    add_column :invoice_moderations, :items_marked, :integer
    add_column :invoice_moderations, :line_items_quantity, :integer
  end
end
