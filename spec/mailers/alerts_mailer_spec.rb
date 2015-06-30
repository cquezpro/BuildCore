describe AlertsMailer do

  before do
    allow(IntercomUpdater).to receive(:update)
  end

  let!(:recipient) { create :individual }
  let!(:invoice) { create :invoice }
  let!(:alert) { create :alert }

  example "#new_alert" do
    expect(Intercom::Message).to receive(:create) do |hash|
      expect(hash[:to][:type]).to eq("user")
      expect(hash[:to][:email]).to be_present
      expect(hash[:body]).to be_present
      expect(hash[:body]).to include(invoice.id.to_s)
    end

    Sidekiq::Testing.inline! do
      described_class.new_alert(recipient.id, alert.id, invoice.id).deliver
    end
  end

end
