class AddStatusAndBlockCounterToWorkers < ActiveRecord::Migration
  def change
    add_column :workers, :status, :integer, default: 0
    add_column :workers, :block_counter, :integer, default: 0
  end
end
