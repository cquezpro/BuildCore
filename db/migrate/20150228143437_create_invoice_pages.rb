class CreateInvoicePages < ActiveRecord::Migration
  def change
    create_table :invoice_pages do |t|
      t.integer :line_items_count
      t.integer :page_number
      t.integer :worker_id
      t.integer :survey_id
      t.integer :invoice_id

      t.timestamps
    end
  end
end
