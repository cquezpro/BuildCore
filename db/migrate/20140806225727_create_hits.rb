class CreateHits < ActiveRecord::Migration
  def change
    create_table :hits do |t|
      t.integer :status, default: 0
      t.string :mt_hit_id
      t.string :url

      t.timestamps
    end

    add_index :hits, :mt_hit_id
  end
end
