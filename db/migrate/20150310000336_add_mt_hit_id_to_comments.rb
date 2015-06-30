class AddMtHitIDToComments < ActiveRecord::Migration
  def change
    add_column :comments, :mt_hit_id, :string
    add_column :comments, :mt_worker_id, :string
    add_column :comments, :mt_assignment_id, :string
    add_column :hits, :title, :string
  end
end
