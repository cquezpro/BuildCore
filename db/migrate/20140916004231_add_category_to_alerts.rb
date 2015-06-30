class AddCategoryToAlerts < ActiveRecord::Migration
  def change
    add_column :alerts, :category, :integer
    remove_column :alerts, :invoice_id
    add_column :alerts, :invoice_owner_id, :integer
    add_index :alerts, :invoice_owner_id
  end
end
