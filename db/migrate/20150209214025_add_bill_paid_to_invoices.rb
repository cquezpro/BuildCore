class AddBillPaidToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :bill_paid, :boolean, default: false
  end
end
