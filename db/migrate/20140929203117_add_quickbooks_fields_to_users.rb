class AddQuickbooksFieldsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :qb_token, :string
    add_column :users, :qb_secret, :string
    add_column :users, :realm_id, :string
    add_column :users, :token_expires_at, :datetime
    add_column :users, :reconnect_token_at, :datetime
  end
end
