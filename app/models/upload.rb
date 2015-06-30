class Upload < ActiveRecord::Base
  has_attached_file :image, :default_url => "/images/:style/missing.png"
  belongs_to :invoice, inverse_of: :uploads
  belongs_to :sms

  ALLOWED_CONTENT_TYPES = %w[image/jpg image/jpeg image/png image/gif application/pdf]

  validates_attachment :image, content_type: { content_type: ALLOWED_CONTENT_TYPES }

  def image_url
    image.url
  end

  def url
    if Rails.env.development?
      "http://localhost:3000#{image_url}"
    elsif Rails.env.test?
      # http://localhost would work as well, but requires server running
      "file://#{image.path}"
    else
      base_url = "http://billsync1.s3.amazonaws.com/uploads/"
      path = image.url.split('billsync1/uploads/')
      path.shift
      path.unshift(base_url)
      path.join
    end
  end

  def isPdf?
    image_content_type == 'application/pdf'
  end

  def isImage?
    image_content_type != 'application/pdf'
  end

end
