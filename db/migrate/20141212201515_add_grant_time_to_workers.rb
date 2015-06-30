class AddGrantTimeToWorkers < ActiveRecord::Migration
  def change
    add_column :workers, :grant_time, :datetime
  end
end
