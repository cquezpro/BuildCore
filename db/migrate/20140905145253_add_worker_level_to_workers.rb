class AddWorkerLevelToWorkers < ActiveRecord::Migration
  def change
    remove_column :workers, :blocked
    add_column :workers, :worker_level, :integer, default: 0
  end
end
