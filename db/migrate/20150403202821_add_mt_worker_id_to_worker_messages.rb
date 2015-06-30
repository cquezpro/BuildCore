class AddMtWorkerIDToWorkerMessages < ActiveRecord::Migration
  def change
    add_column :worker_messages, :mt_worker_id, :string
  end
end
