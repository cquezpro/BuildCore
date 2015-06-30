class AddVerifiedUserToUsers < ActiveRecord::Migration
  def change
    add_column :users, :veified_user, :integer, default: 0
    add_column :users, :first_amount_verification, :integer
    add_column :users, :second_amount_verification, :integer
    add_column :users, :verification_attempts, :integer, default: 1
    add_column :users, :verification_status, :integer, default: 0
  end
end
