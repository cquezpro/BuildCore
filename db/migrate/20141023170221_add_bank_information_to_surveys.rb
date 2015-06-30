class AddBankInformationToSurveys < ActiveRecord::Migration
  def change
    add_column :surveys, :bank_information_present, :boolean
  end
end
