class AddDefaultEarningToWorkers < ActiveRecord::Migration
  def change
    change_column :workers, :earning, :decimal, precision: 8, scale: 2, default: 0.0
    change_column :workers, :earning_rate, :decimal, precision: 8, scale: 2, default: 0.0
  end
end
