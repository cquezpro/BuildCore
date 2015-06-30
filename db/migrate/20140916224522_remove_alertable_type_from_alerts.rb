class RemoveAlertableTypeFromAlerts < ActiveRecord::Migration
  def change
    remove_column :alerts, :alertable_type
    add_column :alerts, :alertable_type, :string
  end
end
