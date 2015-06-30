class AddProcesedByTurkToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :processed_by_turk, :boolean, default: false
  end
end
