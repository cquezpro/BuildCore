class ChangeColumnsOtherFeeAndTax < ActiveRecord::Migration
  def change
    change_column :invoices, :tax, 'decimal USING CAST(tax AS decimal)', precision: 8, scale: 2
    change_column :invoices, :other_fee, 'decimal USING CAST(other_fee AS decimal)', precision: 8, scale: 2
    change_column :invoice_moderations, :tax, 'decimal USING CAST(tax AS decimal)', precision: 8, scale: 2
    change_column :invoice_moderations, :other_fee, 'decimal USING CAST(other_fee AS decimal)', precision: 8, scale: 2
  end
end
