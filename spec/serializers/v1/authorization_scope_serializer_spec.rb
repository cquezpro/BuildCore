describe Api::V1::AuthorizationScopeSerializer do

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::AuthorizationScopeSerializer }
  let(:options) { {root: false} }

  context "for expense account" do
    let(:model) { build_stubbed :expense_account, name: "Materials" }

    it { is_expected.to be_json_eql(model.id).at_path("id") }
    it { is_expected.to be_json_eql("Materials".to_json).at_path("name") }
    it { is_expected.to be_json_eql("Expense".to_json).at_path("type") }
  end

  context "for vendor" do
    let(:model) { build_stubbed :vendor, name: "Another Co." }

    it { is_expected.to be_json_eql(model.id).at_path("id") }
    it { is_expected.to be_json_eql("Another Co.".to_json).at_path("name") }
    it { is_expected.to be_json_eql("Vendor".to_json).at_path("type") }
  end

  context "for QuickBooks class" do
    let(:model) { build_stubbed :qb_class, name: "HQ" }

    it { is_expected.to be_json_eql(model.id).at_path("id") }
    it { is_expected.to be_json_eql("HQ".to_json).at_path("name") }
    it { is_expected.to be_json_eql("QBClass".to_json).at_path("type") }
  end

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
