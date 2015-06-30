class RemoveTotalAndPriceFromLineItems < ActiveRecord::Migration
  def change
    remove_column :line_items, :total
    remove_column :line_items, :price
    add_column :line_items, :price, :decimal, precision: 8, scale: 2, default: 0.0
    add_column :line_items, :total, :decimal, precision: 8, scale: 2, default: 0.0
    add_column :line_items, :worker_id, :integer
    add_column :line_items, :created_by, :integer, default: 0

    add_index :line_items, :worker_id
  end
end
