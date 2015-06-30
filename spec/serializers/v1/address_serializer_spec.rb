describe Api::V1::AddressSerializer do

  before(:all) { @upload = build_stubbed :address }

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::AddressSerializer }
  let(:model) { @upload }
  let(:options) { {root: false} }

  it { is_expected.to have_json_path("id") }

  it { is_expected.to have_json_type(Array).at_path("childrens") }

  it { is_expected.to have_json_path("parent") }

  it { is_expected.to have_json_path("name") }
  it { is_expected.to have_json_path("address1") }
  it { is_expected.to have_json_path("address2") }
  it { is_expected.to have_json_path("city") }
  it { is_expected.to have_json_path("state") }
  it { is_expected.to have_json_path("zip") }
  it { is_expected.to have_json_path("created_at") }
  it { is_expected.to have_json_path("updated_at") }
  it { is_expected.to have_json_path("addressable_id") }
  it { is_expected.to have_json_path("addressable_type") }
  it { is_expected.to have_json_path("created_by") }
  it { is_expected.to have_json_path("user_id") }
  it { is_expected.to have_json_path("parent_id") }
  it { is_expected.to have_json_path("qb_class_id") }
  it { is_expected.to have_json_path("mt_worker_id") }
  it { is_expected.to have_json_path("mt_assignment_id") }
  it { is_expected.to have_json_path("mt_hit_id") }

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
