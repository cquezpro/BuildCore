class ChangeEmailBodyFromInvoices < ActiveRecord::Migration
  def change
    change_column :invoices, :email_body, :text, limit: nil
  end
end
