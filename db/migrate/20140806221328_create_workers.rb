class CreateWorkers < ActiveRecord::Migration
  def change
    create_table :workers do |t|
      t.string  :mt_worker_id
      t.integer :training_level
      t.decimal :earning, precision: 8, scale: 2
      t.decimal :earning_rate, precision: 8, scale: 2
      t.boolean :blocked, default: false
      t.integer :score, default: 0

      t.timestamps
    end

    add_index :workers, :mt_worker_id
  end
end
