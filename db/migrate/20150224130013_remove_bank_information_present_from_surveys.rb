class RemoveBankInformationPresentFromSurveys < ActiveRecord::Migration
  def change
    remove_column :surveys, :bank_information_present
  end
end
