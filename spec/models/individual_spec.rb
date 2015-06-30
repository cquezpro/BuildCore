describe Individual do

  before { class_double("IntercomUpdater").as_stubbed_const.as_null_object }

  it { is_expected.to belong_to(:user) }
  it { is_expected.to belong_to(:role) }
  it { is_expected.to have_many(:approvals) }
  it { is_expected.to have_and_belong_to_many(:permitted_expense_accounts) }
  it { is_expected.to have_and_belong_to_many(:permitted_qb_classes) }
  it { is_expected.to have_and_belong_to_many(:permitted_vendors) }
  it { is_expected.to have_one(:common_alert_settings) }
  it { is_expected.to have_many(:vendor_alert_settings) }

  it "has role assigned by default" do
    expect(Individual.new.role).to be_present
  end

  describe "#randomize_password" do
    subject { build_stubbed :individual }
    before { allow(subject).to receive(:persist).and_return(true) }

    it "changes individual's password" do
      expect {
        subject.randomize_password
      }.to change { subject[:encrypted_password] }
    end

    it "returns 8-characters long password" do
      expect(subject.randomize_password).to match(/\A[-\w]{8}\Z/)
    end

    it "does not save the record" do
      expect(subject).not_to receive(:persist)
      subject.randomize_password
      expect(subject).to be_valid
      expect(subject).to be_changed
    end

    it "sends e-mail with password after saving" do
      Sidekiq::Testing.inline! do
        generated_password = subject.randomize_password
        expect(Intercom::Message).to receive(:create) do |hash|
          expect(hash[:body]).to match(/\s#{generated_password}\s/)
        end
        subject.save!
      end
    end
  end

end
