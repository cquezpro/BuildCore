class AddNewAlertTypeToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :alert_duplicate_invoice_text, :boolean, default: false
    add_column :vendors, :alert_duplicate_invoice_email, :boolean, default: false
    add_column :vendors, :alert_duplicate_invoice_flag, :boolean, default: true
  end
end
