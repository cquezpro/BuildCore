class AddFilePasswordToUsers < ActiveRecord::Migration
  def change
    add_column :users, :file_password, :string
  end
end
