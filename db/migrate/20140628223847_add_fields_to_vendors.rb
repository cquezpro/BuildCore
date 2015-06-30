class AddFieldsToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :contact_person, :string
    add_column :vendors, :buisness_number, :string
    add_column :vendors, :payment_end, :string
    add_column :vendors, :payment_end_exceed, :string
    add_column :vendors, :payment_end_payments, :string
    add_column :vendors, :payment_end_date, :string
    add_column :vendors, :payment_amount, :string
    add_column :vendors, :payment_amount_fixed, :string
    add_column :vendors, :alert_total_text, :string
    add_column :vendors, :alert_total_email, :string
    add_column :vendors, :alert_total_flag, :string
    add_column :vendors, :alert_item_text, :string
    add_column :vendors, :alert_item_email, :string
    add_column :vendors, :alert_item_flag, :string
    add_column :vendors, :alert_itemqty_text, :string
    add_column :vendors, :alert_itemqty_email, :string
    add_column :vendors, :alert_itemqty_flag, :string
    add_column :vendors, :alert_itemprice_text, :string
    add_column :vendors, :alert_itemprice_email, :string
    add_column :vendors, :alert_itemprice_flag, :string
  end
end
