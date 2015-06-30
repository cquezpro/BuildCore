class RemoveIndexNameFromVendors < ActiveRecord::Migration
  def change
    remove_index :vendors, column: :name
    add_index :vendors, [:name, :user_id], unique: true
  end
end
