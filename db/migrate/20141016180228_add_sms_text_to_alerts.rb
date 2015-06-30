class AddSmsTextToAlerts < ActiveRecord::Migration
  def change
    add_column :alerts, :sms_text, :text
  end
end
