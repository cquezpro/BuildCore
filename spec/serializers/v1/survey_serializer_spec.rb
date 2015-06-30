describe Api::V1::SurveySerializer do

  before(:all) { @item = build_stubbed :survey }

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::SurveySerializer }
  let(:model) { @item }
  let(:options) { {root: false} }

  it { is_expected.to have_json_path("id") }
  it { is_expected.to have_json_path("is_invoice") }
  it { is_expected.to have_json_path("vendor_present") }
  it { is_expected.to have_json_path("address_present") }
  it { is_expected.to have_json_path("amount_due_present") }
  it { is_expected.to have_json_path("is_marked_through") }
  it { is_expected.to have_json_path("invoice_id") }
  it { is_expected.to have_json_path("worker_id") }
  it { is_expected.to have_json_path("mt_hit_id") }
  it { is_expected.to have_json_path("mt_assignment_id") }
  it { is_expected.to have_json_path("mt_worker_id") }
  it { is_expected.to have_json_path("created_at") }
  it { is_expected.to have_json_path("updated_at") }
  it { is_expected.to have_json_path("address_reference") }
  it { is_expected.to have_json_path("user_addresses") }
  it { is_expected.to have_json_path("locations_feature") }

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
