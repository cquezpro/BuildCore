class AddHasItemToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :has_items, :boolean, default: false

    ActiveRecord::Base.transaction do
      LineItem.where(description: InvoiceTransaction::DEFAULT_ITEM_NAME).find_each do |item|
        item.send(:save_has_item_attributes)
      end
    end
  end
end
