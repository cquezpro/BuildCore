class AddOnlyPngToUploads < ActiveRecord::Migration
  def change
    add_column :uploads, :only_png, :boolean, default: false
  end
end
