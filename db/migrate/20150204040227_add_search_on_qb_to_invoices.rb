class AddSearchOnQBToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :search_on_qb, :boolean, default: false
  end
end
