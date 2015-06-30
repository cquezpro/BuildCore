class AddRoleIDColumnToIndividuals < ActiveRecord::Migration
  def change
    add_reference :individuals, :role, index: true
  end
end
