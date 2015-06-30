class ChangeQBParentIDDefaultFromQBClasses < ActiveRecord::Migration
  def change
    change_column :qb_classes, :qb_parent_id, :integer, limit: 8
  end
end
