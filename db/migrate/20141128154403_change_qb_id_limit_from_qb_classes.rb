class ChangeQBIDLimitFromQBClasses < ActiveRecord::Migration
  def change
    change_column :qb_classes, :qb_id, :integer, limit: 8
  end
end
