class ChangeBuisnessNameToBusinessName < ActiveRecord::Migration
  def change
  	remove_column :users, :buisness_name
  	remove_column :users, :buisness_type
  	add_column :users, :business_name, :string
  	add_column :users, :business_type, :string
  end
end
