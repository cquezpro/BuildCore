class AddCheckNumberAndCheckDateToInvoice < ActiveRecord::Migration
  def change
  	add_column :invoices, :check_number, :integer
  	add_column :invoices, :check_date, :date
  end
end
