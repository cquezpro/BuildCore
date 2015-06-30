class ChangeTypeOfAmountDueColumnInInvoiceModerations < ActiveRecord::Migration
  def change
    change_column :invoice_moderations, :amount_due, 'decimal USING CAST(amount_due AS decimal)', precision: 8, scale: 2
  end
end
