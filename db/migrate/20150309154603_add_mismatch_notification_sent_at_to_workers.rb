class AddMismatchNotificationSentAtToWorkers < ActiveRecord::Migration
  def change
    add_column :workers, :warning_notification_sent_at, :datetime
  end
end
