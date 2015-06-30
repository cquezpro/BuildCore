class Api::V1::UploadSerializer < Api::V1::CoreSerializer

  attributes :id, :image_file_name, :image_content_type,
      :image_file_size, :image_updated_at, :invoice_id, :url, :image_url,
      :created_at, :updated_at

end
