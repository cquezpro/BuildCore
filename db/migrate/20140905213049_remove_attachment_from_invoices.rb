class RemoveAttachmentFromInvoices < ActiveRecord::Migration
  def change
    remove_attachment :invoices, :image
    remove_attachment :uploads, :file
  end
end
