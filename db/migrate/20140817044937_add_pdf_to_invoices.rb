class AddPdfToInvoices < ActiveRecord::Migration
  def change
    add_attachment :invoices, :pdf
  end
end
