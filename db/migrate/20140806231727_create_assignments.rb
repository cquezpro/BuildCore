class CreateAssignments < ActiveRecord::Migration
  def change
    create_table :assignments do |t|
      t.integer :hit_id
      t.integer :worker_id
      t.integer :status, default: 0
      t.string  :mt_assignment_id

      t.timestamps
    end

    add_index :assignments, :hit_id
    add_index :assignments, :worker_id
    add_index :assignments, :mt_assignment_id
  end
end
