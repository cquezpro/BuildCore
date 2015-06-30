class ChangeColumnTypesToVerifications < ActiveRecord::Migration
  def change
    change_column :users, :first_amount_verification, :decimal
    change_column :users, :second_amount_verification, :decimal
  end
end
