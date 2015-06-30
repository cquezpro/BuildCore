class AddCheckingScreenFieldsToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :is_invoice, :boolean
    add_column :invoices, :vendor_present, :boolean
    add_column :invoices, :address_present, :boolean
    add_column :invoices, :amount_due_present, :boolean
    add_column :invoices, :bank_information_present, :boolean
    add_column :invoices, :line_items_count, :integer
    add_column :invoices, :is_marked_through, :boolean
  end
end
