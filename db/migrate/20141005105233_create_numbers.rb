class CreateNumbers < ActiveRecord::Migration
  def change
    create_table :numbers do |t|
      t.string :string
      t.integer :user_id

      t.timestamps
    end

    add_index :numbers, :user_id
  end
end
