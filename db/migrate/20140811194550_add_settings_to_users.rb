class AddSettingsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :email_new_invoice_onchange, :boolean, default: false
    add_column :users, :email_new_invoice_daily, :boolean, default: false
    add_column :users, :email_new_invoice_weekly, :boolean, default: false
    add_column :users, :email_new_invoice_none, :boolean, default: false

    add_column :users, :email_change_invoice_onchange, :boolean, default: false
    add_column :users, :email_change_invoice_daily, :boolean, default: false
    add_column :users, :email_change_invoice_weekly, :boolean, default: false
    add_column :users, :email_change_invoice_none, :boolean, default: false

    add_column :users, :email_paid_invoice_onchange, :boolean, default: false
    add_column :users, :email_paid_invoice_daily, :boolean, default: false
    add_column :users, :email_paid_invoice_weekly, :boolean, default: false
    add_column :users, :email_paid_invoice_none, :boolean, default: false

    add_column :users, :email_savings_onchange, :boolean, default: false
    add_column :users, :email_savings_daily, :boolean, default: false
    add_column :users, :email_savings_invoice_weekly, :boolean, default: false
    add_column :users, :email_savings_invoice_none, :boolean, default: false

    add_column :users, :text_new_invoice_onchange, :boolean, default: false
    add_column :users, :text_new_invoice_daily, :boolean, default: false
    add_column :users, :text_new_invoice_weekly, :boolean, default: false
    add_column :users, :text_new_invoice_none, :boolean, default: false

    add_column :users, :text_change_invoice_onchange, :boolean, default: false
    add_column :users, :text_change_invoice_daily, :boolean, default: false
    add_column :users, :text_change_invoice_weekly, :boolean, default: false
    add_column :users, :text_change_invoice_none, :boolean, default: false

    add_column :users, :text_paid_invoice_onchange, :boolean, default: false
    add_column :users, :text_paid_invoice_daily, :boolean, default: false
    add_column :users, :text_paid_invoice_weekly, :boolean, default: false
    add_column :users, :text_paid_invoice_none, :boolean, default: false

    add_column :users, :text_savings_onchange, :boolean, default: false
    add_column :users, :text_savings_daily, :boolean, default: false
    add_column :users, :text_savings_invoice_weekly, :boolean, default: false
    add_column :users, :text_savings_invoice_none, :boolean, default: false
  end
end
