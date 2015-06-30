class AddInvoiceIDToHit < ActiveRecord::Migration
  def change
    add_column :hits, :invoice_id, :integer
    add_index :hits, :invoice_id

    remove_column :invoices, :hit_id
  end
end
