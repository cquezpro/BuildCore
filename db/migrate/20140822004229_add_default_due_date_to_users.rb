class AddDefaultDueDateToUsers < ActiveRecord::Migration
  def change
    add_column :users, :default_due_date, :integer, default: 14
  end
end
