class CreateIndividualsPermittedQBClasses < ActiveRecord::Migration
  def change
    create_table :individuals_permitted_qb_classes do |t|
      t.belongs_to :qb_class, index: true
      t.belongs_to :individual, index: true
    end
  end
end
