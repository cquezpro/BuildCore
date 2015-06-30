class AddHitRewardDefaultToHits < ActiveRecord::Migration
  def change
    remove_column :hits, :reward
    add_column :hits, :reward, :decimal, precision: 8, scale: 2, default: 0.00
  end
end
