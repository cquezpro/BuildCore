class AddPaidWithToInvoice < ActiveRecord::Migration
  def change
    add_column :invoices, :paid_with, :integer
  end
end
