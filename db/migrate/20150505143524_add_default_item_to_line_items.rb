class AddDefaultItemToLineItems < ActiveRecord::Migration
  def change
    add_column :line_items, :default_item, :boolean, default: false
  end
end
