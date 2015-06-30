class AddQBClassIDToLineItems < ActiveRecord::Migration
  def change
    add_column :line_items, :qb_class_id, :integer
  end
end
