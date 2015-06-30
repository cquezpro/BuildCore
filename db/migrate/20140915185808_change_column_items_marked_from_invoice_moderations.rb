class ChangeColumnItemsMarkedFromInvoiceModerations < ActiveRecord::Migration
  def change
    remove_column :invoice_moderations, :items_marked
    add_column :invoice_moderations, :items_marked, :integer, default: 0
  end
end
