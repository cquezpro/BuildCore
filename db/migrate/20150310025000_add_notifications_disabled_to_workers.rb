class AddNotificationsDisabledToWorkers < ActiveRecord::Migration
  def change
    add_column :workers, :notifications_disabled, :boolean, default: :false
  end
end
