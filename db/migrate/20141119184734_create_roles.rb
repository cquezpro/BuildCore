class CreateRoles < ActiveRecord::Migration
  def change
    create_table :roles do |t|
      t.belongs_to :user, index: true
      t.string :name, null: false
      t.string :permissions, array: true, default: []

      t.timestamps
    end
  end
end
