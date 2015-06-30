class AddEmailToInvoiceModerations < ActiveRecord::Migration
  def change
    add_column :invoice_moderations, :email, :string
  end
end
