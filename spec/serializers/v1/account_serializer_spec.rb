describe Api::V1::AccountSerializer do

  before(:all) { @upload = build_stubbed :account }

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::AccountSerializer }
  let(:model) { @upload }
  let(:options) { {root: false} }

  it { is_expected.to have_json_path("id") }

  it { is_expected.to have_json_path("qb_id") }
  it { is_expected.to have_json_path("sync_token") }
  it { is_expected.to have_json_path("name") }
  it { is_expected.to have_json_path("user_id") }
  it { is_expected.to have_json_path("parent_id") }
  it { is_expected.to have_json_path("sub_account") }
  it { is_expected.to have_json_path("account_type") }
  it { is_expected.to have_json_path("account_sub_type") }
  it { is_expected.to have_json_path("classification") }
  it { is_expected.to have_json_path("status") }
  it { is_expected.to have_json_path("created_at") }
  it { is_expected.to have_json_path("updated_at") }

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
