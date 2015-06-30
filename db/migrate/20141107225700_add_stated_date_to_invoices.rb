class AddStatedDateToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :stated_date, :date
  end
end
