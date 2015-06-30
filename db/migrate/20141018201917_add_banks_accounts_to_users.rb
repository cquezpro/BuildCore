class AddBanksAccountsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :bank_account_id, :integer
  end
end
