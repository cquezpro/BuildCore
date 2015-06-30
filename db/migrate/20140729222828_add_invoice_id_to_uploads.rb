class AddInvoiceIDToUploads < ActiveRecord::Migration
  def change
    add_column :uploads, :invoice_id, :integer
    remove_column :invoices, :upload_id
  end
end
