class RemoveAwsReferencesFromInvoiceModerations < ActiveRecord::Migration
  def change
    remove_column :invoice_moderations, :aws_worker_id
    remove_column :invoice_moderations, :aws_assignment_id
  end
end
