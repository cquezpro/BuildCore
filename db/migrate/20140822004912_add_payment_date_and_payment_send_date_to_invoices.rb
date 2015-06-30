class AddPaymentDateAndPaymentSendDateToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :payment_send_date, :date
    add_column :invoices, :payment_date, :date
  end
end
