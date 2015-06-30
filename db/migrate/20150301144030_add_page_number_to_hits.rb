class AddPageNumberToHits < ActiveRecord::Migration
  def change
    add_column :hits, :page_number, :integer, default: 1
    remove_column :surveys, :line_items_count
  end
end
