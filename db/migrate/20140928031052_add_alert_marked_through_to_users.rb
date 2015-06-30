class AddAlertMarkedThroughToUsers < ActiveRecord::Migration
  def change
    add_column :users, :alert_marked_through, :boolean, default: true
  end
end
