class AddAchDateToUsers < ActiveRecord::Migration
  def change
    add_column :users, :ach_date, :date
  end
end
