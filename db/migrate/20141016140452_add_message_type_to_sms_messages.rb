class AddMessageTypeToSmsMessages < ActiveRecord::Migration
  def change
    add_column :sms_messages, :message_type, :integer, default: 0
    add_column :sms_messages, :alert_id, :integer
    add_index :sms_messages, :number_id
  end
end
