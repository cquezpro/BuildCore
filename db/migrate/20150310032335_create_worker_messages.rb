class CreateWorkerMessages < ActiveRecord::Migration
  def change
    create_table :worker_messages do |t|
      t.string :body
      t.string :subject
      t.integer :worker_id

      t.timestamps
    end
  end
end
