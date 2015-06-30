class AddRequestNumberToInvoice < ActiveRecord::Migration
  def change
    add_column :invoices, :request_number, :integer, default: 0
    add_column :vendors, :request_number, :integer, default: 0
    add_column :accounts, :request_number, :integer, default: 0
  end
end
