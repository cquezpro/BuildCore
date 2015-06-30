class AddQBClassIDToAddresses < ActiveRecord::Migration
  def change
    add_column :addresses, :qb_class_id, :integer
  end
end
