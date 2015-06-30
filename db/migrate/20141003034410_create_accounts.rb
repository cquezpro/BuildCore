class CreateAccounts < ActiveRecord::Migration
  def change
    create_table :accounts do |t|
      t.integer :qb_id
      t.integer :sync_token
      t.string :name
      t.integer :user_id
      t.integer :parent_id
      t.boolean :sub_account, default: false
      t.string :account_type
      t.string :account_sub_type
      t.string :classification
      t.integer :status, default: 0


      t.timestamps
    end

    add_index :accounts, :user_id
  end
end
