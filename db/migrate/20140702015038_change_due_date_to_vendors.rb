class ChangeDueDateToVendors < ActiveRecord::Migration
  def change
    add_column    :vendors, :pay_day,               :integer
    add_column    :vendors, :payment_date,          :date

    remove_column :vendors, :payment_term
    remove_column :vendors, :payment_end
    remove_column :vendors, :payment_amount
    remove_column :vendors, :routing_number
    remove_column :vendors, :bank_account_number
    remove_column :vendors, :alert_total_text
    remove_column :vendors, :alert_total_email
    remove_column :vendors, :alert_total_flag
    remove_column :vendors, :alert_item_text
    remove_column :vendors, :alert_item_email
    remove_column :vendors, :alert_item_flag
    remove_column :vendors, :alert_itemqty_text
    remove_column :vendors, :alert_itemqty_email
    remove_column :vendors, :alert_itemqty_flag
    remove_column :vendors, :alert_itemprice_text
    remove_column :vendors, :alert_itemprice_email
    remove_column :vendors, :alert_itemprice_flag

    add_column :vendors, :payment_term,          :integer, default: 0
    add_column :vendors, :payment_end,           :integer,  default: 0
    add_column :vendors, :payment_amount,        :integer,  default: 0
    add_column :vendors, :routing_number,        :integer
    add_column :vendors, :bank_account_number,   :integer
    add_column :vendors, :alert_total_text,      :boolean, default: false
    add_column :vendors, :alert_total_email,     :boolean, default: false
    add_column :vendors, :alert_total_flag,      :boolean, default: false
    add_column :vendors, :alert_item_text,       :boolean, default: false
    add_column :vendors, :alert_item_email,      :boolean, default: false
    add_column :vendors, :alert_item_flag,       :boolean, default: false
    add_column :vendors, :alert_itemqty_text,    :boolean, default: false
    add_column :vendors, :alert_itemqty_email,   :boolean, default: false
    add_column :vendors, :alert_itemqty_flag,    :boolean, default: false
    add_column :vendors, :alert_itemprice_text,  :boolean, default: false
    add_column :vendors, :alert_itemprice_email, :boolean, default: false
    add_column :vendors, :alert_itemprice_flag,  :boolean, default: false

    rename_column :vendors, :buisness_number, :business_number

    add_index     :vendors, :name, unique: true
  end
end
