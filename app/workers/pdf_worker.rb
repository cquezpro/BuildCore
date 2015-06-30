class PdfWorker
  include Sidekiq::Worker

  def perform(invoice_id)
    # Error on following line is normal and result of race condition.
    # On subsequent attempt it usually works.
    invoice = Invoice.find(invoice_id)
    files = invoice.uploads
    return if invoice.uploads.empty?
    if invoice.pdf?
      tempdir = Dir.mktmpdir "pdf-downloader-"
      cached_file_path = File.join(tempdir, Devise.friendly_token)
      invoice.pdf.copy_to_local_file :original, cached_file_path
      file = File.binread(cached_file_path)
      inspector = PDF::Inspector::Page.analyze(file)
      invoice.pdf_total_pages = inspector.pages.size
      invoice.save
      create_pngs(invoice, cached_file_path)
      FileUtils.rm_r tempdir
      UniqueWorker.perform_async
      return
    end

    pdf_path = PDFCreator.create(invoice.uploads.where(only_png: false), invoice)
    file = File.binread(pdf_path)
    inspector = PDF::Inspector::Page.analyze(file)
    invoice.pdf_total_pages = inspector.pages.size
    invoice.pdf = File.open(pdf_path)
    invoice.save
    create_pngs(invoice, invoice.pdf)

    UniqueWorker.perform_async
    true
  end

  def create_pngs(invoice, pdf)
    invoice.uploads.where(only_png: true).destroy_all
    files = PdfSpliter.new(pdf).to_images
    files.each do |file|
      Upload.create(invoice: invoice, image: file, only_png: true)
    end
  end
end
