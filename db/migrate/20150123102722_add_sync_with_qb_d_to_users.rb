class AddSyncWithQBDToUsers < ActiveRecord::Migration
  def change
    add_column :users, :sync_with_qb_d, :boolean, default: false
    add_column :users, :synced_qb, :boolean, default: false

    User.where.not(qb_token: nil, qb_secret: nil).update_all({synced_qb: true})
  end
end
