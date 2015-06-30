class AddQuickbooksFieldsToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :qb_id, :integer
    add_column :invoices, :sync_token, :integer

    add_column :line_items, :qb_id, :integer
    add_column :line_items, :sync_token, :integer
  end
end
