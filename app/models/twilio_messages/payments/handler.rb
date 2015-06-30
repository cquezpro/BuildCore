class TwilioMessages::Payments::Handler
  include TwilioMessages::TwilioClient

  attr_reader :params, :number, :body, :user, :other_numbers

  def initialize(params, number)
    @params = params
    @number = number
    @user = number.individual.user
    @body = params[:Body].try(:downcase)
    @numbers = @number.individual.user.numbers
  end

  def confirm?
    body == 'yes' || body == 'y'
  end

  def reject?
    body == 'no' || body == 'n'
  end

  def deferred_response?
     [body == 't', body == 'w', body == 'm'].any? && deferring_bill?
  end

  def start_deferred?
    body == 'd'
  end

  def last_bill_reviewing?
    get_bill(1)
  end

  def deferring_bill?
    get_bill(2)
  end

  def run!
    case
    when start_deferred?
      join_model = get_invoice_sms_thread(1)
      join_model.deferred!
      send_notifications!(%{Great we will defer that bill.  When would you like to be reminded again?, 't' for tomorrow, 'w' for next week, or 'm' for next month.})
    when deferred_response?
      join_model = get_invoice_sms_thread(2)
      deferred_bill = join_model.invoice
      defer_bill
      send_notifications!("Great we will bring it back then.#{set_new_bill_as_reviewing}")
    when last_bill_reviewing?
      set_bill_status!
      response = set_new_bill_as_reviewing
      send_notifications!(response)
    when confirm?
      send_notifications!(set_new_bill_as_reviewing)
    end
  end

  private

  def defer_bill
    join_model = get_invoice_sms_thread(2)
    deferred_bill = join_model.invoice
    case body
    when 't'
      deferred_bill.update_attributes({deferred_date: Date.tomorrow})
    when 'w'
      deferred_bill.update_attributes({deferred_date: 1.week.from_now})
    when 'm'
      deferred_bill.update_attributes({deferred_date: 1.month.from_now})
    end
    join_model.reviewed!
  end

  def set_bill_status!
    join_model = get_invoice_sms_thread(1)
    last_bill = join_model.invoice
    if confirm?
      last_bill.pay_invoice!
    elsif body == 'p'
      last_bill.mark_as_paid!
    elsif body == 't'
      last_bill.mark_as_deleted!
    end
    join_model.reviewed!
  end

  def set_new_bill_as_reviewing
    if new_bill = get_invoice_sms_thread(0)
      new_bill.reviewing!
      new_bill.invoice.to_sms
    else
      last_thread.locked!
      response = "Great that was your last bill!"
      response << "You currently have #{user.invoices.need_information.count} bills needing more information please login at #{Rails.application.routes.url_helpers.root_url}app#/login please login to your dashboard to take care of these.." if user.invoices.need_information.any?
      response << "Thanks for your time. We will get to work on your bills!"
      response
    end
  end

  def last_thread
    number.last_thread(:payment)
  end

  def next_bill
    get_bill(0)
  end

  def get_bill(status)
    get_invoice_sms_thread(status).try(:invoice)
  end

  def get_invoice_sms_thread(status)
    last_thread.invoices_sms_threads.where(status: status).first
  end

  def create_sms
    SmsMessage.create(number: number, sms_thread: last_thread, message_type: :payment_type)
  end

  def send_notifications!(sms_body)
    if numbers.size > 1
      numbers.each do |number|
        twilio_client.account.messages.create(:from => SERVER_NUMBER,
                                              :to => number.string,
                                              :body => sms_body)
      end
    else
      twilio_response(sms_body)
    end
  end
end
