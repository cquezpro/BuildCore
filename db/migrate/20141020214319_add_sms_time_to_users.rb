class AddSmsTimeToUsers < ActiveRecord::Migration
  def change
    add_column :users, :sms_time, :integer, default: 11
  end
end
