class AddTermsOfServiceToUsers < ActiveRecord::Migration
  def change
    add_column :users, :term_of_service, :boolean, default: false
  end
end
