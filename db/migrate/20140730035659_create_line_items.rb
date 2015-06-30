class CreateLineItems < ActiveRecord::Migration
  def change
    create_table :line_items do |t|
      t.integer :quantity
      t.string :code
      t.string :description
      t.float :price
      t.float :total
      t.integer :invoice_id

      t.timestamps
    end

    add_index :line_items, :invoice_id
  end
end
