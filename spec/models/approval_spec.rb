RSpec.describe Approval do
  it { is_expected.to belong_to(:invoice) }
  it { is_expected.to belong_to(:approver) }

  context "when approved_at is blank" do
    subject{ build_stubbed :approval, approved_at: nil }

    example "#approver is required" do
      subject.approver = nil
      expect(subject).not_to be_valid
      expect(subject.errors).to include(:approver)
    end

    example "#done? is false" do
      expect(subject.done?).to be(false)
    end
  end

  context "when approved_at is present" do
    subject{ build_stubbed :approval, approved_at: 10.minutes.ago }

    example "#approver is required" do
      subject.approver = nil
      expect(subject).not_to be_valid
      expect(subject.errors).to include(:approver)
    end

    example "#done? is true" do
      expect(subject.done?).to be(true)
    end
  end

  describe "#finish" do
    let(:approval){ build_stubbed :approval, approved_at: nil }
    before{ allow(approval).to receive(:save) }

    it "saves the approval" do
      expect(approval).to receive(:save!)
      approval.finish
    end

    it "sets approved_at" do
      expect{ approval.finish }.to change{ approval.approved_at }.from(nil)
    end

    it "fails for approvals which are already done" do
      approval.approved_at = 10.minutes.ago
      expect{ approval.finish }.to raise_exception
    end
  end
end
