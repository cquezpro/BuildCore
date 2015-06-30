desc "Send new signatures"
task :send_signatures => :environment do

  attachments = []
  puts "> Creating files."
  index = 0
  tmpdir = Dir.tmpdir
  User.where('signature_created_at >= ?', Date.today).where.not(signature: nil).find_each do |user|
    begin
      decoded_image = Base64.decode64(user.signature.split("base64,").last)
    rescue
      next
    end
    next unless decoded_image.present?
    image = Tempfile.new(user.signature_filename)
    image.binmode
    image.write decoded_image
    image.rewind

    jpg_image = MiniMagick::Image.open(image.path, "w+")
    jpg_image.path #=> "/var/folders/k7/6zx6dx6x7ys3rv3srh0nyfj00000gn/T/magick20140921-75881-1yho3zc.jpg"
    jpg_image.format "jpg"
    file_path = tmpdir + "/#{user.signature_filename}"
    jpg_image.write file_path

    MiniMagick::Tool::Convert.new do |convert|
      convert << file_path
      convert.background('gray')
      convert.negate
      convert << file_path
    end
    # byebug
    file = File.open(file_path, "r")
    attachments << { file: file.read, filename: user.signature_filename }
  end

  if attachments.any?
    puts "> Sending mail."
    DefaultNotifier.send_signatures(attachments).deliver
  end

  puts "> Done"
end
