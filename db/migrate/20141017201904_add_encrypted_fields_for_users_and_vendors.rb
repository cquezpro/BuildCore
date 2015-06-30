class AddEncryptedFieldsForUsersAndVendors < ActiveRecord::Migration
  def change
    [:users, :vendors].each do |table|
      add_column table, :encrypted_bank_account_number, :binary
      add_column table, :encrypted_routing_number, :binary
    end
  end
end
