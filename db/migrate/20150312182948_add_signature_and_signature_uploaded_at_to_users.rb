class AddSignatureAndSignatureUploadedAtToUsers < ActiveRecord::Migration
  def change
    add_column :users, :signature, :text
    add_column :users, :signature_created_at, :datetime
  end
end
