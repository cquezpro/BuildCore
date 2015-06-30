class AddQbdIDToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :qb_d_id, :string
    add_column :vendors, :sync_qb, :boolean, default: false
    add_column :vendors, :search_on_qb, :boolean, default: false
    add_column :vendors, :edit_sequence, :string
    add_index :vendors, :qb_d_id

    add_column :invoices, :qb_d_id, :string
    add_column :invoices, :sync_qb, :boolean, default: false
    add_column :invoices, :edit_sequence, :string
    add_index :invoices, :qb_d_id

    add_column :line_items, :qb_d_id, :string
    add_column :line_items, :sync_qb, :boolean, default: false
    add_column :line_items, :edit_sequence, :string
    add_column :line_items, :search_on_qb, :boolean, default: false
    add_index :line_items, :qb_d_id

    add_column :accounts, :qb_d_id, :string
    add_column :accounts, :sync_qb, :boolean, default: false
    add_column :accounts, :edit_sequence, :string
    add_column :accounts, :search_on_qb, :boolean, default: false
    add_column :accounts, :parent_ref, :string
    add_index :accounts,  :qb_d_id

    add_column :qb_classes, :qb_d_id, :string
    add_column :qb_classes, :sync_qb, :boolean, default: false
    add_column :qb_classes, :edit_sequence, :string
    add_column :qb_classes, :search_on_qb, :boolean, default: false
    add_column :qb_classes, :parent_ref, :string
    add_index :qb_classes,  :qb_d_id
  end
end
