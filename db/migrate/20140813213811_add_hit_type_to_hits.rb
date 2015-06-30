class AddHitTypeToHits < ActiveRecord::Migration
  def change
    add_column :hits, :hit_type, :integer, default: 0
  end
end
