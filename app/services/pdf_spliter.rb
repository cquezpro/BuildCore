require "find"
require 'tmpdir'

class PdfSpliter
  attr_accessor :pdf

  def initialize(pdf)
    @pdf = pdf
  end

  def to_pdf
    command = "gs -sDEVICE=pdfwrite -dSAFER -o #{output_path("pdf")} #{input_path}"
    Subexec.run command, timeout: 45
    collect_files({pop: true})
  end

  def to_images
    command = "gs -dSAFER -dBATCH -dNOPAUSE -r150 -sDEVICE=png16m -dTextAlphaBits=4 -sOutputFile=#{output_path("png")} #{input_path}"  #{}"gs dSAFER -dBATCH -dNOPAUSE -r150 -sDEVICE=png16m -dTextAlphaBits=4 -sOutputFile=#{output_path("jpg")} #{input_path}"
    Subexec.run command, timeout: 45
    collect_files
  end

  def output_path(type)
    output_path = "#{tempdir}/page.%d.#{type}"
  end

  def input_path
    pdf.try(:path) || pdf
  end

  def collect_files(options = {})
    files = []
    Find.find(tempdir).each {|e| files << File.open(e) }
    files.pop if options[:pop]
    files.shift
    files
  end

  def tempdir
    @tempdir ||= Dir.mktmpdir "pdf-creator-#{Devise.friendly_token}"
  end

end
