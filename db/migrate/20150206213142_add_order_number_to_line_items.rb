class AddOrderNumberToLineItems < ActiveRecord::Migration
  def change
    add_column :line_items, :order_number, :integer
  end
end
