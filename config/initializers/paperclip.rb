if Rails.env.production?
  Paperclip::Attachment.default_options[:url] = ENV['AWS_ASSET_URL']
  Paperclip::Attachment.default_options[:path] = '/:class/:attachment/:id_partition/:style/:filename'
end
