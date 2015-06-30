class CreateAlerts < ActiveRecord::Migration
  def change
    create_table :alerts do |t|
      t.integer :invoice_id

      t.timestamps
    end
    add_index :alerts, :invoice_id
  end
end
