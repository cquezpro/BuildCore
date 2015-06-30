class CreateSmsThreads < ActiveRecord::Migration
  def change
    create_table :sms_threads do |t|
      t.integer :thread_type
      t.integer :user_id
      t.integer :invoice_id
      t.integer :number_id
      t.integer :status, default: 0

      t.timestamps
    end

    add_index :sms_threads, :user_id
    add_index :sms_threads, :invoice_id
  end
end
