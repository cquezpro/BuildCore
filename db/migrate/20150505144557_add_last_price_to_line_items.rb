class AddLastPriceToLineItems < ActiveRecord::Migration
  def change
    add_column :line_items, :last_price, :decimal, precision: 8, scale: 2, default: 0.0
  end
end
