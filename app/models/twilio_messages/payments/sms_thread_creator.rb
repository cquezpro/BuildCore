class TwilioMessages::Payments::SmsThreadCreator < SmsThread
  include TwilioMessages::TwilioClient
  include ActionView::Helpers::TextHelper

  after_create :send_first_text

  def self.build_with(invoices)
    instance = new(invoices: invoices, thread_type: :payment)
    instance
  end

  private

  def send_first_text
    selected_numbers.each do |selected_number|
      begin
        twilio_client.account.messages.create(:from => SERVER_NUMBER, :to => selected_number, :body => message)
      rescue Twilio::REST::RequestError => e
        Intercom::Event.create(
          :event_name => "twilio-number-to", :created_at => Time.now.to_i,
          :email => user.individuals.first.try(:email),
          :metadata => {
            message: e
          }
        )
        destroy
      end
    end
  end

  def message
    %{Hello from billSync, ready to crank through your bills today? You have #{pluralize(invoices.count, 'bill')} to go through type "y" to start}
  end

  def selected_numbers
    user.payment_numbers
  end

  def user
    invoices.first.user
  end
end
