class AddModalUsedToUsers < ActiveRecord::Migration
  def change
    add_column :users, :modal_used, :boolean, default: false
  end
end
