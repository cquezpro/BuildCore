class AddSubmitedToHits < ActiveRecord::Migration
  def change
    add_column :hits, :submited, :boolean, default: false
  end
end
