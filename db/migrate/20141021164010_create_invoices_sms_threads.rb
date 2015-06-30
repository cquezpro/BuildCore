class CreateInvoicesSmsThreads < ActiveRecord::Migration
  def change
    create_table :invoices_sms_threads do |t|
      t.integer :sms_thread_id
      t.integer :invoice_id
      t.integer :status, default: 0

      t.timestamps
    end
  end
end
