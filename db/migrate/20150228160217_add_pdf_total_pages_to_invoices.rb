class AddPdfTotalPagesToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :pdf_total_pages, :integer, default: 1
  end
end
