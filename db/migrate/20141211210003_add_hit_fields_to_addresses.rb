class AddHitFieldsToAddresses < ActiveRecord::Migration
  def change
    add_column :addresses, :mt_worker_id, :string
    add_column :addresses, :mt_assignment_id, :string
    add_column :addresses, :mt_hit_id, :string
  end
end
