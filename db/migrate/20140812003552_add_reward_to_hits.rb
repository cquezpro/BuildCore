class AddRewardToHits < ActiveRecord::Migration
  def change
    add_column :hits, :reward, :decimal, precision: 8, scale: 2
  end
end
