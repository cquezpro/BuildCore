class AddSyncCountToUsers < ActiveRecord::Migration
  def change
    add_column :users, :sync_count, :integer, default: 0
  end
end
