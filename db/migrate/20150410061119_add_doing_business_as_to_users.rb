class AddDoingBusinessAsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :doing_business_as, :string
  end
end
