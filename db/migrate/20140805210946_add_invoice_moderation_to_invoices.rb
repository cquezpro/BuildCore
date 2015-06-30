class AddInvoiceModerationToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :invoice_moderation, :boolean, default: false
    add_column :invoices, :reviewed, :boolean, default: false
  end
end
