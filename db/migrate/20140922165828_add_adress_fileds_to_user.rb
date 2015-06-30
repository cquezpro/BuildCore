class AddAdressFiledsToUser < ActiveRecord::Migration
  def change
  	add_column :users, :billing_address1, :string
  	add_column :users, :billing_address2, :string
  	add_column :users, :billing_city, :string
  	add_column :users, :billing_state, :string
  	add_column :users, :billing_zip, :string
  end
end
