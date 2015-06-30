class AddWorkerIDToInvoiceModeration < ActiveRecord::Migration
  def change
    add_column :invoice_moderations, :worker_id, :integer
    add_column :invoice_moderations, :assignment_id, :integer

    add_index :invoice_moderations, :worker_id
    add_index :invoice_moderations, :assignment_id
  end
end
