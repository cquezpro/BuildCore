class AddAlertableIDToAndAlertableTypeToAlerts < ActiveRecord::Migration
  def change
    add_column :alerts, :alertable_id, :integer
    add_column :alerts, :alertable_type, :integer
  end
end
