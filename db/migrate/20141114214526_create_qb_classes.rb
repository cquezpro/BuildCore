class CreateQBClasses < ActiveRecord::Migration
  def change
    create_table :qb_classes do |t|
      t.integer :sync_token
      t.string :metadata
      t.boolean :sub_class, default: false
      t.integer :qb_parent_id
      t.string :fully_qualified_name
      t.boolean :active, default: true
      t.integer :user_id
      t.integer :qb_id
      t.string :name

      t.timestamps
    end
    add_index :qb_classes, :user_id
  end
end
