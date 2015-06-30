class AddQBCompanyNameToUsers < ActiveRecord::Migration
  def change
    add_column :users, :qb_company_name, :string
    add_column :users, :authorized_to_sync, :boolean, default: false
    add_column :users, :qb_wrong_company, :string
    add_column :users, :last_qb_sync, :datetime
  end
end
