class AddTxnLineIDToLineItems < ActiveRecord::Migration
  def change
    add_column :line_items, :txn_line_id, :string
  end
end
