class AddPolymorphicFieldsToAddress < ActiveRecord::Migration
  def change
    add_column :addresses, :addressable_id, :integer
    add_column :addresses, :addressable_type, :string
    remove_column :addresses, :user_id
  end
end
