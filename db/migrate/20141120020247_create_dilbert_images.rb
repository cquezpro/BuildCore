class CreateDilbertImages < ActiveRecord::Migration
  def change
    create_table :dilbert_images do |t|
      t.string :title
      t.string :link
      t.string :guid
      t.datetime :publication_date
      t.string :description
      t.string :original_image_url
      t.attachment :image

      t.timestamps
    end
  end
end
