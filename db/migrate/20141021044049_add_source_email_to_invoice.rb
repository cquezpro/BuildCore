class AddSourceEmailToInvoice < ActiveRecord::Migration
  def change
    add_column :invoices, :source_email, :string
  end
end
