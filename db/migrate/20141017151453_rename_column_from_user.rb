class RenameColumnFromUser < ActiveRecord::Migration
  def change
    rename_column :vendors, :alert_marked_through_app, :alert_marked_through_email
  end
end
