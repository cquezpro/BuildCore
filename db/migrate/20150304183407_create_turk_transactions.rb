class CreateTurkTransactions < ActiveRecord::Migration
  def change
    create_table :turk_transactions do |t|
      t.string :code
      t.string :description
      t.decimal :quantity, precision: 8, scale: 2, default: 0.0
      t.decimal :price, precision: 8, scale: 2, default: 0.0
      t.decimal :discount, precision: 8, scale: 2, default: 0.0
      t.decimal :total, precision: 8, scale: 2, default: 0.0
      t.integer :worker_id
      t.integer :assignment_id
      t.integer :hit_id
      t.integer :invoice_id

      t.boolean :pay_for_this_transactino, default: false
      t.boolean :matched, default: false

      t.timestamps
    end
  end
end
