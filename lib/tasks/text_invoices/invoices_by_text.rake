namespace :sms do
  desc "Send invoices"
  task :send_invoices => [:environment] do
    include TwilioMessages::TwilioClient

    def send_message(to, message, user)
      begin
        twilio_client.account.messages.create(:from => SERVER_NUMBER,
                                              :to => to,
                                              :body => message)
      rescue Twilio::REST::RequestError => e
      Intercom::Event.create(
        :event_name => "twilio-number-to", :created_at => Time.now.to_i,
        :email => user.email,
        :metadata => {
          message: e
        }
      )
      end
    end

    User.find_each.each() do |user|
      next unless user.pay_bills_through_text && user.timezone
      tz = TZInfo::Timezone.get(user.timezone)
      today_date = tz.now.to_date
      current_hour = tz.now.hour
      next unless current_hour == user.sms_time && user.selected_number

      if user.invoices.order_by_act_by.by_status(4).by_deferred_date.present?
        invoices = user.invoices.order_by_act_by.by_status(4).by_deferred_date
        thread = TwilioMessages::Payments::SmsThreadCreator.build_with(invoices)
        thread.number = user.selected_number
        thread.user = user
        thread.save
      elsif user.invoices.need_information.present?
        message = %{"You currently have #{user.invoices.need_information.count} bills that need additional information, please login to your account online to take care of these bills" }
        send_message(user.selected_number.string, message, user)
      elsif ![user.invoices.need_information.any?, user.invoices.ready_for_payment.any?].all?
        message = "Hello from billSync, you are all clear for today! Don't forget to send us your invoices we'll knock them out for you. Have an awesome day!"
        send_message(user.selected_number.string, message, user)
      end
    end

  end
end
