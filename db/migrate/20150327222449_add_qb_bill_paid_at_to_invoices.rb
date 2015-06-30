class AddQBBillPaidAtToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :qb_bill_paid_at, :datetime
  end
end
