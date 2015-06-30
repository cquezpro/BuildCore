describe Notifier do

  let(:invoice) { build_stubbed :invoice, source_email: "invoices@example.com" }

  around { |example| Sidekiq::Testing.inline! { example.run } }

  example "#user_not_found" do
    expect_sending_intercom_message
    described_class.user_not_found("recipient@example.com").deliver
  end

  example "#mail_without_attachment" do
    expect_sending_intercom_message
    described_class.mail_without_attachment("recipient@example.com").deliver
  end

  example "#notify_invoices_received" do
    expect_sending_intercom_message
    described_class.notify_invoices_received([invoice], "recipient@example.com").deliver
  end

  example "#bill_processed" do
    expect_sending_intercom_message
    described_class.bill_processed(invoice).deliver
  end

  def expect_sending_intercom_message
    expect(Intercom::Message).to receive(:create) do |hash|
      expect(hash[:to][:type]).to eq("user")
      expect(hash[:to][:email]).to be_present
      expect(hash[:body]).to be_present
    end
  end

end
