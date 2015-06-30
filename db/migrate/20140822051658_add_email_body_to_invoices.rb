class AddEmailBodyToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :email_body, :string
  end
end
