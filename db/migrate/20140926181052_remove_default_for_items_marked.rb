class RemoveDefaultForItemsMarked < ActiveRecord::Migration
  def change
    change_column_default(:invoice_moderations, :items_marked, nil)
  end
end
