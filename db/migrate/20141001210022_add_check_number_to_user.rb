class AddCheckNumberToUser < ActiveRecord::Migration
  def change
  	add_column :users, :check_number, :integer, :null => false, :default => 8000000
  end
end
