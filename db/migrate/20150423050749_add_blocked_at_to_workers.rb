class AddBlockedAtToWorkers < ActiveRecord::Migration
  def change
    add_column :workers, :blocked_at, :datetime
  end
end
