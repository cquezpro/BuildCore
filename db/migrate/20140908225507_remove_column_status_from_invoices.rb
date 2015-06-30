class RemoveColumnStatusFromInvoices < ActiveRecord::Migration
  def change
    remove_column :invoices, :status
    add_column :invoices, :status, :integer, default: 1
  end
end
