class RemoveAttachmentFromInvoiceModerations < ActiveRecord::Migration
  def change
    remove_attachment :invoice_moderations, :image
  end
end
