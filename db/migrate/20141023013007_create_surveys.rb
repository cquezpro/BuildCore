class CreateSurveys < ActiveRecord::Migration
  def change
    create_table :surveys do |t|
      t.boolean :is_invoice
      t.boolean :vendor_present
      t.boolean :address_present
      t.boolean :amount_due_present
      t.integer :line_items_count
      t.boolean :is_marked_through
      t.integer :invoice_id
      t.index :invoice_id
      t.integer :worker_id
      t.string :mt_hit_id
      t.string :mt_assignment_id
      t.string :mt_worker_id

      t.timestamps
    end

    add_column :invoices, :invoice_survey_id, :integer
    add_index :invoices, :invoice_survey_id
  end
end
