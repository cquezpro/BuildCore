class AddResendingPaymentAtToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :resending_payment_at, :datetime
  end
end
