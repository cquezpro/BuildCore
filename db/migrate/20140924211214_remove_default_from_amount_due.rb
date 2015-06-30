class RemoveDefaultFromAmountDue < ActiveRecord::Migration
  def change
    change_column_default(:invoices, :amount_due, nil)
  end
end
