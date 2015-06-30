class AddLocationsFeatureToUsers < ActiveRecord::Migration
  def change
    add_column :users, :locations_feature, :boolean
  end
end
