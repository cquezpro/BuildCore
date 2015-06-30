class TwilioMessages::Invoices::Creator < SmsMessage
  attr_accessor :params, :images, :image

  def self.read_from(params, number)
    instance = new
    instance.params = params
    instance.text = params["Body"]
    instance.images = []
    0.upto(10) do |i|
      instance.images << params["MediaUrl#{i}"] if params["MediaUrl#{i}"]
    end
    instance.number = number

    instance
  end

  def multiple?
    text.try(:downcase) == "m"
  end

  def undo?
    text.try(:downcase) == "u"
  end

  def single?
    last_thread.try(:single?)
  end

  def done?
    text.try(:downcase) == "d"
  end

  def image?
    params[:MediaUrl0].present?
  end

  def valid_sms?
    [image?, multiple?, undo?, single?, done?].any?
  end

  def already_on_multiple?
    last_thread && last_thread.multiple? && multiple?
  end

  def run!
    return respond_with(:invalid_number) unless number
    return respond_with(:invalid) unless valid_sms?
    return respond_with(:already_on_multiple) if already_on_multiple?
    case
    when multiple?
      create_multiple_thread
      respond_with(:start_multiple)
    when image?
      create_or_add_to_thread
    when undo?
      delete_last_upload
      respond_with(:deleted)
    when done?
      if last_thread
        lock_thread!
        respond_with(:done, last_thread.invoice)
      else
        respond_with(:not_multiple_mode_detected)
      end
    end
  end

  def create_or_add_to_thread
    if last_thread && last_thread.multiple?
      images.each do |image|
        @image = image
        append_to_thread
      end
      respond_with(:multiple, last_thread.invoice)
    else
      images.each do |image|
        @image = image
        create_thread
      end
      sms_thread.lock!
      respond_with(:single)
    end
  end

  def create_multiple_thread
    thread = thread_builder(:multiple)
    thread.invoice = Invoice.create(user: number.user)
    thread.save
    self.sms_thread = thread
  end

  def create_thread(thread_type = :single)
    thread = thread_builder(thread_type)
    thread.invoice = create_invoice
    thread.save
    self.sms_thread = thread
  end

  def to_sms
    save
    SmsMessage.find(id)
  end

  def append_to_thread
    last_thread.sms_messages << self
    last_thread.invoice.uploads << Upload.create(image: image)
    last_thread.invoice.pdf.clear
    last_thread.invoice.save
    last_thread.invoice.create_pdf
  end

  def last_thread
    @last_thread ||= number.last_thread(:multiple) || number.last_thread(:single)
  end

  def thread_builder(thread_type)
    SmsThread.new({thread_type: thread_type, user: number.user, number: number})
  end

  def create_invoice
    invoice = Invoice.new(user: number.user)
    invoice.uploads << Upload.create(image: do_download_remote_image(image))
    invoice.save
    invoice
  end

  def lock_thread!
    last_thread.locked!
  end

  def delete_last_upload
    if last_thread && invoice = last_thread.invoice
      invoice.uploads.order(created_at: :desc).first.try(:destroy)
      invoice.pdf.clear if invoice.pdf
      invoice.save
      invoice.create_pdf
    end
  end

  def respond_with(response_type, invoice = nil)
    TwilioMessages::Invoices::SmsReplier.new(response_type, params[:From], invoice).respond!
  end

  def do_download_remote_image(image_url)
    io = open(URI.parse(image_url))
    def io.original_filename; base_uri.path.split('/').last; end
    io.original_filename.blank? ? nil : io
  end
end
