describe Api::V1::InvoiceModerationSerializer do

  before(:all) { @im = build_stubbed :im_first_review }

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::InvoiceModerationSerializer }
  let(:model) { @im }
  let(:options) { {root: false} }

  it { is_expected.to have_json_path("id") }
  it { is_expected.to have_json_path("invoice_id") }
  it { is_expected.to have_json_path("number") }
  it { is_expected.to have_json_path("vendor_id") }
  it { is_expected.to have_json_path("amount_due") }
  it { is_expected.to have_json_path("tax") }
  it { is_expected.to have_json_path("other_fee") }
  it { is_expected.to have_json_path("due_date") }
  it { is_expected.to have_json_path("date") }
  it { is_expected.to have_json_path("status") }
  it { is_expected.to have_json_path("created_at") }
  it { is_expected.to have_json_path("updated_at") }
  it { is_expected.to have_json_path("hit_id") }
  it { is_expected.to have_json_path("worker_id") }
  it { is_expected.to have_json_path("assignment_id") }
  it { is_expected.to have_json_path("moderation_type") }
  it { is_expected.to have_json_path("name") }
  it { is_expected.to have_json_path("address1") }
  it { is_expected.to have_json_path("address2") }
  it { is_expected.to have_json_path("city") }
  it { is_expected.to have_json_path("state") }
  it { is_expected.to have_json_path("zip") }
  it { is_expected.to have_json_path("pdf_url") }
  it { is_expected.to have_json_path("selected") }
  it { is_expected.to have_json_path("original_invoice") }

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
