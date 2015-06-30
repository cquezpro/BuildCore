class CreateSmsMessages < ActiveRecord::Migration
  def change
    create_table :sms_messages do |t|
      t.integer :sms_thread_id
      t.integer :number_id
      t.string :text

      t.timestamps
    end

    add_index :sms_messages, :sms_thread_id
  end
end
