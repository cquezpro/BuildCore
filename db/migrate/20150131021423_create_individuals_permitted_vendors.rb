class CreateIndividualsPermittedVendors < ActiveRecord::Migration
  def change
    create_table :individuals_permitted_vendors do |t|
      t.belongs_to :vendor, index: true
      t.belongs_to :individual, index: true
    end
  end
end
