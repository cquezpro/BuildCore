class AddFailedItemsToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :failed_items, :integer
  end
end
