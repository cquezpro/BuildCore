class AddAwsWorkerIDToInvoiceModerations < ActiveRecord::Migration
  def change
    add_column :invoice_moderations, :aws_worker_id, :string
    add_column :invoice_moderations, :aws_assignment_id, :string
    add_column :invoices, :hit_id, :string
    add_index  :invoices, :hit_id
  end
end
