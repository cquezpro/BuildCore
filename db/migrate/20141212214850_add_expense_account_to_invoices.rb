class AddExpenseAccountToInvoices < ActiveRecord::Migration
  def change
    add_reference :invoices, :expense_account, index: true
  end
end
