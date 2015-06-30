class AddSelectedFromDefaultToLineItems < ActiveRecord::Migration
  def change
    add_column :line_items, :selected_from_default_expense, :boolean, default: false
    add_column :line_items, :selected_from_default_liability, :boolean, default: false
    add_column :vendors, :selected_from_default_expense, :boolean, default: false
    add_column :vendors, :selected_from_default_liability, :boolean, default: false
  end
end
