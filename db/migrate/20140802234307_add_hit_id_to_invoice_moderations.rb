class AddHitIDToInvoiceModerations < ActiveRecord::Migration
  def change
    add_column :invoice_moderations, :hit_id, :string
    add_column :invoice_moderations, :line_items_quantity, :integer, default: 0
  end
end
