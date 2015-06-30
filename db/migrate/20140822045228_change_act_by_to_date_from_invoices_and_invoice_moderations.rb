class ChangeActByToDateFromInvoicesAndInvoiceModerations < ActiveRecord::Migration
  def change
    remove_column :invoices, :act_by
    remove_column :invoice_moderations, :act_by
    add_column :invoices, :act_by, :date
    add_column :invoice_moderations, :act_by, :date
  end
end
