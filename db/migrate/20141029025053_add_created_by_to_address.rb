class AddCreatedByToAddress < ActiveRecord::Migration
  def change
    add_column :addresses, :created_by, :integer, default: 0
  end
end
