class AddDefaultsToUsers < ActiveRecord::Migration
  def change
    change_column :users, :email_new_invoice_weekly, :boolean, default: true
    change_column :users, :email_change_invoice_weekly, :boolean, default: true
    change_column :users, :email_paid_invoice_weekly, :boolean, default: true
    change_column :users, :email_new_invoice_weekly, :boolean, default: true
    change_column :users, :email_savings_invoice_weekly, :boolean, default: true

    change_column :users, :text_new_invoice_none, :boolean, default: true
    change_column :users, :text_change_invoice_none, :boolean, default: true
    change_column :users, :text_paid_invoice_none, :boolean, default: true
    change_column :users, :text_savings_invoice_none, :boolean, default: true
  end
end
