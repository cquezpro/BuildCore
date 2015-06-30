class CreateVendors < ActiveRecord::Migration
  def change
    create_table :vendors do |t|
      t.integer :user_id
      t.string :default_class
      t.string :name
      t.string :address1
      t.string :address2
      t.string :address3
      t.string :city
      t.string :state
      t.string :zip
      t.string :country
      t.string :routing_number
      t.string :bank_account_number
      t.string :fax_number
      t.string :cell_number
      t.string :email
      t.string :tax_id_number
      t.string :payment_term
      t.integer :after_bill_date
      t.integer :before_due_date
      t.integer :after_due_date
      t.integer :day_of_the_month
      t.integer :after_recieved
      t.decimal :auto_amount
      t.integer :end_after_payments
      t.decimal :end_autopay_over_amount
      t.decimal :alert_over

      t.timestamps
    end
  end
end
