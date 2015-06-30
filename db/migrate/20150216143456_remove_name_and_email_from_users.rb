class RemoveNameAndEmailFromUsers < ActiveRecord::Migration
  def change
    revert do
      add_column :users, :name, :string
      add_column :users, :email, :string, default: "", null: false
    end
  end
end
