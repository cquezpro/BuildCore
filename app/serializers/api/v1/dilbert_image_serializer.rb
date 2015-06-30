class Api::V1::DilbertImageSerializer < Api::V1::CoreSerializer
  attributes :id

  attributes :local_image_url

  attributes :title
  attributes :link
  attributes :guid
  attributes :publication_date
  attributes :description
  attributes :original_image_url
  attributes :image_file_name
  attributes :image_content_type
  attributes :image_file_size
  attributes :image_updated_at
  attributes :created_at
  attributes :updated_at
end
