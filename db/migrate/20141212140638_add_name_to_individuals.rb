class AddNameToIndividuals < ActiveRecord::Migration
  def change
    add_column :individuals, :name, :string, null: false, default: "User"
  end
end
