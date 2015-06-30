class CreateUploads < ActiveRecord::Migration
  def change
    create_table :uploads do |t|

      t.attachment :file
      t.timestamps
    end

    add_column :invoices, :upload_id, :integer

    add_index :invoices, :upload_id
  end
end
