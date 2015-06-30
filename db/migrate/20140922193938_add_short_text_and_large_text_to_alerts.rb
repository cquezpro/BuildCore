class AddShortTextAndLargeTextToAlerts < ActiveRecord::Migration
  def change
    add_column :alerts, :short_text, :text
    add_column :alerts, :large_text, :text
    add_column :alerts, :average, :string
  end
end
