class ChangeAlertsAverageToDecimal < ActiveRecord::Migration
  def change
    change_column :alerts, :average, 'decimal USING CAST(average AS decimal)', precision: 8, scale: 2
  end
end
