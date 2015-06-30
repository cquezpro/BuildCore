RSpec.describe CommonAlertSettings, :type => :model do
  it { is_expected.to belong_to(:individual) }

  it "defines ::TOGGLES which is non-empty Array of Strings" do
    expect(described_class::TOGGLES).to be_an(Array)
    expect(described_class::TOGGLES).not_to be_empty
    expect(described_class::TOGGLES).to all be_a(String)
  end
end
