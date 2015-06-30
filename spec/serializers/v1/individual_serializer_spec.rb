describe Api::V1::IndividualSerializer do

  before(:all) do
    @user = build_stubbed :user
    @vendor = build_stubbed :vendor, name: "Some Vendor"
    @qb_class = build_stubbed :qb_class, name: "Some Location"
    @expense_account = build_stubbed :expense_account, name: "Some Category"
    @individual = build_stubbed :individual, user: @user, email: "someone@example.test",
        permitted_vendors: [@vendor], permitted_qb_classes: [@qb_class],
        permitted_expense_accounts: [@expense_account]
  end

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::IndividualSerializer }
  let(:model) { @individual }
  let(:options) { {root: false} }

  let(:vendor_expectation) do
    {type: "Vendor", id: @qb_class.id, name: @vendor.name}.to_json
  end

  let(:qb_class_expectation) do
    {type: "QBClass", id: @vendor.id, name: @qb_class.name}.to_json
  end

  let(:expense_account_expectation) do
    {type: "Expense", id: @expense_account.id, name: @expense_account.name}.to_json
  end

  it { is_expected.to be_json_eql(@individual.id.to_json).at_path("id") }
  it { is_expected.to be_json_eql("someone@example.test".to_json).at_path("email") }
  it { is_expected.to have_json_type(String).at_path("name") }
  it { is_expected.to have_json_path("role_id") }
  it { is_expected.to have_json_path("limit_min") }
  it { is_expected.to have_json_path("limit_max") }

  it { is_expected.to have_json_type(Array).at_path("authorization_scopes") }
  it { is_expected.to have_json_size(3).at_path("authorization_scopes") }
  it { is_expected.to include_json(vendor_expectation).at_path("authorization_scopes") }
  it { is_expected.to include_json(qb_class_expectation).at_path("authorization_scopes") }
  it { is_expected.to include_json(expense_account_expectation).at_path("authorization_scopes") }

  it { is_expected.not_to have_json_path("permissions") }
  it { is_expected.not_to have_json_path("user") }

  it "may not contain key which name contains \"password\"" do
    expect(JSON.parse(subject).keys.map(&:to_s).grep(/password/)).to be_empty
  end

  it "may not contain key which name contains \"crypted\"" do
    expect(JSON.parse(subject).keys.map(&:to_s).grep(/crypted/)).to be_empty
  end

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
