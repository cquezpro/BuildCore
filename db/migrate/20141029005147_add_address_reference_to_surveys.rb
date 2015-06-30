class AddAddressReferenceToSurveys < ActiveRecord::Migration
  def change
    add_column :surveys, :address_reference, :string
  end
end
