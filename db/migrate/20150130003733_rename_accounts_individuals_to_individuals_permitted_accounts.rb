class RenameAccountsIndividualsToIndividualsPermittedAccounts < ActiveRecord::Migration
  def change
    rename_table "accounts_individuals", "individuals_permitted_accounts"
  end
end
