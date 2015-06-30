class AddAveragePriceAndAverageVolumeToInvoices < ActiveRecord::Migration
  def change
    add_column :line_items, :average_price, :decimal
    add_column :line_items, :average_volume, :decimal
  end
end
