class AddLocationTextToUsers < ActiveRecord::Migration
  def change
    add_column :users, :email_no_location_found_onchange, :boolean, default: false
    add_column :users, :email_no_location_found_daily , :boolean, default: false
    add_column :users, :email_no_location_found_weekly, :boolean, default: true
    add_column :users, :email_no_location_found_none, :boolean, default: false
    add_column :users, :text_no_location_found_onchange, :boolean, default: false
    add_column :users, :text_no_location_found_daily , :boolean, default: false
    add_column :users, :text_no_location_found_weekly, :boolean, default: false
    add_column :users, :text_no_location_found_none, :boolean, default: true
  end
end
