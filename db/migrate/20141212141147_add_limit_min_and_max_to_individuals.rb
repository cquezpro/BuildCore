class AddLimitMinAndMaxToIndividuals < ActiveRecord::Migration
  def change
    add_column :individuals, :limit_min, :decimal
    add_column :individuals, :limit_max, :decimal
  end
end
