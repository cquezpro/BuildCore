class CreateEmails < ActiveRecord::Migration
  def change
    create_table :emails do |t|
      t.integer :user_id
      t.string :string

      t.timestamps
    end
    add_index :emails, :string, unique: true
  end
end
