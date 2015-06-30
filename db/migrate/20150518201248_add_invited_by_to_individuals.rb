class AddInvitedByToIndividuals < ActiveRecord::Migration
  def change
    add_column :individuals, :invited_by, :integer
    add_index :individuals, :invited_by
  end
end
