describe Api::V1::VendorTypeaheadSerializer do

  # this factory is very slow
  before(:all) { @vendor = build_stubbed :vendor }

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::VendorTypeaheadSerializer }
  let(:model) { @vendor }
  let(:options) { {root: false} }

  # should be skipped
  it { is_expected.not_to have_json_path("encrypted_bank_account_number") }
  it { is_expected.not_to have_json_path("encrypted_routing_number") }
  it { is_expected.not_to have_json_path("email") }

  it { is_expected.to have_json_type(Integer).at_path("id") }

  it { is_expected.to have_json_path("id") }
  it { is_expected.to have_json_path("name") }
  it { is_expected.to have_json_path("address1") }
  it { is_expected.to have_json_path("address2") }
  it { is_expected.to have_json_path("city") }
  it { is_expected.to have_json_path("state") }
  it { is_expected.to have_json_path("zip") }
  it { is_expected.to have_json_path("bank_account_number") }
  it { is_expected.to have_json_path("routing_number") }

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
