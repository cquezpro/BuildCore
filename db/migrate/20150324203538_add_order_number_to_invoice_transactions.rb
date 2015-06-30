class AddOrderNumberToInvoiceTransactions < ActiveRecord::Migration
  def change
    remove_column :line_items, :order_number
  end
end
