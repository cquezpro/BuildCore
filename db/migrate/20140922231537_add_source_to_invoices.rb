class AddSourceToInvoices < ActiveRecord::Migration
  def change
  	add_column :invoices, :source, :integer, default: 0
  end
end
