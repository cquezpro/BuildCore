class CreateResponses < ActiveRecord::Migration
  def change
    create_table :responses do |t|
      t.integer :worker_id
      t.string :field_name
      t.string :field_response
      t.integer :trackable_id
      t.string :trackable_type
      t.integer :status, default: 0
      t.integer :assignment_id
      t.string :expected_response

      t.timestamps
    end

    add_column :surveys, :assignment_id, :integer
    add_index :surveys, :assignment_id
  end
end
