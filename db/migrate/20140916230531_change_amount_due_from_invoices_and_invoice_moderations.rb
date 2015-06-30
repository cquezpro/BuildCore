class ChangeAmountDueFromInvoicesAndInvoiceModerations < ActiveRecord::Migration
  def change
    change_column :invoices, :amount_due, 'decimal USING CAST(amount_due AS decimal)', precision: 8, scale: 2, default: 0.0
  end
end
