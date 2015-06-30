class AddTurkAttributesToLineItems < ActiveRecord::Migration
  def change
    add_column :line_items, :mt_worker_id,     :string
    add_column :line_items, :mt_hit_id,        :string
    add_column :line_items, :mt_assignment_id, :string
    add_index :line_items,  :mt_hit_id
  end
end
