describe Api::V1::LineItemSerializer do

  before(:all) { @item = build_stubbed :line_item }

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::LineItemSerializer }
  let(:model) { @item }
  let(:options) { {root: false} }

  it { is_expected.to have_json_type(Integer).at_path("id") }

  it { is_expected.to have_json_path("code") }
  it { is_expected.to have_json_path("description") }
  it { is_expected.to have_json_path("invoice_id") }
  it { is_expected.to have_json_path("created_at") }
  it { is_expected.to have_json_path("updated_at") }
  it { is_expected.to have_json_path("qb_id") }
  it { is_expected.to have_json_path("sync_token") }
  it { is_expected.to have_json_path("liability_account_id") }
  it { is_expected.to have_json_path("expense_account_id") }
  it { is_expected.to have_json_path("average_price") }
  it { is_expected.to have_json_path("average_volume") }
  it { is_expected.to have_json_path("qb_class_id") }

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
