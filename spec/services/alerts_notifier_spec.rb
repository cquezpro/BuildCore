describe AlertsNotifier, :vcr do

  subject { AlertsNotifier.new alert, invoice }

  let!(:user) { create :user }
  let!(:alert) { create :alert, category.to_sym }
  let!(:vendor) { create :vendor, user: user, alert_settings: vendor_alert_settings }
  let!(:invoice) { create :invoice, user: user, vendor: vendor }

  let!(:one_who_should_receive_alerts) { create :individual, :with_number, user: user }
  let!(:one_who_should_not_receive_alerts) { create :individual, :with_number, user: user }

  let!(:vendor_alert_settings) do
    [
      create(:vendor_alert_settings, :with_all_enabled, individual: one_who_should_receive_alerts),
      create(:vendor_alert_settings, :with_all_disabled, individual: one_who_should_not_receive_alerts)
    ]
  end

  shared_examples "never sends email nor sms notification" do
    it "never sends sms notification" do
      allow(Intercom::Message).to receive(:create)
      expect_any_instance_of(Twilio::REST::Messages).not_to receive(:create)
      expect(TwilioMessages::Alerts::AlertsComposer).not_to receive(:new)
      Sidekiq::Testing.inline! { subject.notify! }
    end

    it "never sends Intercom notification" do
      allow_any_instance_of(Twilio::REST::Messages).to receive(:create)
      expect(Intercom::Message).not_to receive(:create)
      Sidekiq::Testing.inline! { subject.notify! }
    end
  end

  shared_examples "expect sending email and sms notifications" do
    it "sends sms notification" do
      allow(Intercom::Message).to receive(:create)
      expect_any_instance_of(Twilio::REST::Messages).to receive(:create).once
      expect(
        TwilioMessages::Alerts::AlertsComposer
      ).to receive(:new).once.with(one_who_should_receive_alerts, anything, invoice).and_call_original
      Sidekiq::Testing.inline! { subject.notify! }
    end

    it "sends Intercom notification" do
      allow_any_instance_of(Twilio::REST::Messages).to receive(:create)
      expect(Intercom::Message).to receive(:create).once
      Sidekiq::Testing.inline! { subject.notify! }
    end
  end

  Alert.categories.keys.each do |category_name|
    context "for #{category_name} alert category" do
      let(:category) { category_name }

      if category_name.in? %w[no_location processing_items]
        include_examples "never sends email nor sms notification"
      elsif category_name.in? %w[new_vendor resending_payment]
        skip "actually should send notification but not implemented yet"
        include_examples "never sends email nor sms notification"
      else
        include_examples "expect sending email and sms notifications"
      end
    end
  end

end
