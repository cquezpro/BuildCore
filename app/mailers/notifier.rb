class Notifier < ActionMailer::Base
  include Concerns::IntercomMessenger

  def user_not_found(email)
    @sender = email
    mail(
      to:       email,
      subject:  "Your email was not found on our database"
    )
  end

  def mail_without_attachment(email)
    @sender = email
    mail(
      to:       email,
      subject:  "Your email doesn't contain any invoice"
    )
  end

  def notify_invoices_received(invoices, email)
    mail(
      to:       email,
      subject:  "We received your bills and are processsing it."
    )
  end

  def bill_processed(invoice)
    @invoice = invoice

    mail(
      to:       invoice.source_email,
      subject:  "We received your bills and are processsing it."
    )
  end
end
