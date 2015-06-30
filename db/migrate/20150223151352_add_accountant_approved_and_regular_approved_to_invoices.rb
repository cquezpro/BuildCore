class AddAccountantApprovedAndRegularApprovedToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :accountant_approved, :boolean, default: false
    add_column :invoices, :regular_approved, :boolean, default: false
  end
end
