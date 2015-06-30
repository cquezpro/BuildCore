class EmailProcessor
  attr_reader :mail, :sender_email, :logger
  attr_accessor :invoices

  def initialize(mail)
    @mail = mail
    @sender_email = mail.from[:email]
    @invoices = []
    @logger = logger = Logger.new(STDOUT)
  end

  def process
    individual = Individual.find_by(email: mail.from[:email])
    return send_email_not_found unless individual
    return mail_without_attachment unless mail.attachments.present?
    user = individual.user
    if mail.subject.try(:downcase) == "stm"
      mail.attachments.each do |attachment|
        if attachment.content_type == "application/pdf"
          files = PdfSpliter.new(attachment).to_pdf
          files.each do |file|
            user.invoices.create(uploads: [Upload.create(image: file)], source: :by_email, source_email: sender_email)
          end
        else
          user.invoices.create(uploads: [Upload.create(image: attachment)], email_body: mail.body, source: :by_email, source_email: sender_email)
        end
      end
    else
      mail.attachments.each do |attachment|
        user.invoices.create(uploads: [Upload.create(image: attachment)], email_body: mail.body, source: :by_email, source_email: sender_email)
      end
    end

    notify_invoices_received
  end

  def send_email_not_found
    Notifier.user_not_found(sender_email).deliver
  end

  def mail_without_attachment
    Notifier.mail_without_attachment(sender_email).deliver
  end

  def notify_invoices_received
    Notifier.notify_invoices_received(invoices, sender_email).deliver
  end
end
