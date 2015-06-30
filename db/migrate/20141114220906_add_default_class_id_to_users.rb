class AddDefaultClassIDToUsers < ActiveRecord::Migration
  def change
    add_column :users, :default_class_id, :integer
  end
end
