class CreateInvoiceModerations < ActiveRecord::Migration
  def change
    create_table :invoice_moderations do |t|
      t.integer :invoice_id
      t.integer :number
      t.attachment :image
      t.integer :vendor_id
      t.string :amount_due
      t.string :tax
      t.string :other_fee
      t.date   :due_date
      t.string :resale_number
      t.string :account_number
      t.string :delivery_address1
      t.string :delivery_address2
      t.string :delivery_address3
      t.string :delivery_city
      t.string :delivery_state
      t.string :delivery_zip
      t.date :date
      t.boolean :invoice_total
      t.boolean :new_item
      t.boolean :line_item_quantity
      t.boolean :unit_price
      t.string :act_by
      t.integer :status, default: 0

      t.timestamps
    end
  end
end
