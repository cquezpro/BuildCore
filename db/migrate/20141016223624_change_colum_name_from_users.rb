class ChangeColumNameFromUsers < ActiveRecord::Migration
  def change
    rename_column :users, :term_of_service, :terms_of_service
  end
end
