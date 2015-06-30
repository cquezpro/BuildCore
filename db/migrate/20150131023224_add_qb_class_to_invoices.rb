class AddQBClassToInvoices < ActiveRecord::Migration
  def change
    add_reference :invoices, :qb_class, index: true
  end
end
