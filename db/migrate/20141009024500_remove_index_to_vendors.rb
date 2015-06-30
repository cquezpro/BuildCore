class RemoveIndexToVendors < ActiveRecord::Migration
  def change
    remove_index(:vendors, name: 'index_vendors_on_name_and_user_id')
  end
end
