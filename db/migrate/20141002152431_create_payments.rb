class CreatePayments < ActiveRecord::Migration
  def change
    create_table :payments do |t|
      t.integer :qb_id
      t.integer :sync_token
      t.date :date
      t.integer :vendor_id

      t.timestamps
    end
  end
end
