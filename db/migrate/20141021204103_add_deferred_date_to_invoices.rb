class AddDeferredDateToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :deferred_date, :date
  end
end
