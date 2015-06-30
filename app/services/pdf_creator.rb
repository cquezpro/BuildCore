require 'prawn'
require 'mini_magick'
require 'tmpdir'

# Typical usage:
#     creator = PDFCreator.new
#     creator.append_upload Upload.first
#     creator.append_text "Hi!"
#     creator.render_file "path/to/file.pdf"
# or:
#     path_to_file = PDFCreator.create [Upload.file], "Hi!"
class PDFCreator

  IMAGE_OPTIONS = {fit: [612, 792]}
  GHOSTSCRIPT_OPTIONS = "-sDEVICE=pdfwrite -sPAPERSIZE=a5"

  attr_reader :parts

  def initialize
    @parts = []
  end

  # Combo method which creates new PDF from array of Uploads and Invoice
  def self.create(uploads, invoice)
    instance = new

    uploads.each do |upl|
      instance.append_upload upl
    end

    if invoice && invoice.email_body.present?
      instance.append_text invoice.email_body
    end

    basename = "invoices-#{Devise.friendly_token}.pdf"
    path = Rails.root.join "public", "temp", basename
    instance.merge path
    instance.cleanup
    path
  end

  # Adds file attached to passed Upload record
  def append_upload upload
    cached_file_path = File.join tempdir, Devise.friendly_token
    upload.image.copy_to_local_file :original, cached_file_path
    if upload.isImage?
      preprocessed_file_path = prepare_image cached_file_path
    else
      preprocessed_file_path = cached_file_path
    end
    parts << preprocessed_file_path
  end

  def append_text str
    preprocessed_file_path = prepare_text str
    parts << preprocessed_file_path
  end

  def merge target_pdf_path
    cmd "gs", GHOSTSCRIPT_OPTIONS, "-o", target_pdf_path, "-dBATCH", *parts
  end

  # Performs cleanup by removing all the temporary files.
  def cleanup
    parts.clear
    @tempdir, to_remove = nil, @tempdir
    if to_remove.present? && File.exists?(to_remove)
      FileUtils.rm_r to_remove
    end
  end

  def finalize
    cleanup
  end

private

  def tempdir
    @tempdir ||= Dir.mktmpdir "pdf-creator-"
  end

  def prepare_image path
    converted_path = "#{path}.pdf"
    MiniMagick::Image.new(path).tap do |img|
      img.rotate(90) if img.width > img.height
    end
    MiniMagick::Tool::Convert.new do |cmd|
      cmd << path << converted_path
    end
    converted_path
  end

  def prepare_text str
    converted_path = File.join tempdir, "text-#{Devise.friendly_token}.pdf"
    Prawn::Document.generate(converted_path) do
      font "Courier"
      font_size 12
      text str
    end
    converted_path
  end

  def cmd *segments
    command = segments.join " "
    command_result = Subexec.run command, timeout: 45
    command_result.exitstatus.zero? or raise "Command failed: `#{command}`."
  end

end
