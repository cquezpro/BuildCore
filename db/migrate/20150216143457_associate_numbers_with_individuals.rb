class AssociateNumbersWithIndividuals < ActiveRecord::Migration
  def change
    rename_column :numbers, :user_id, :individual_id
  end
end
