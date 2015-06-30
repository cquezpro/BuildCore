describe Api::V1::UploadSerializer do

  before(:all) { @upload = build_stubbed :upload }

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::UploadSerializer }
  let(:model) { @upload }
  let(:options) { {root: false} }

  it { is_expected.to have_json_path("id") }
  it { is_expected.to have_json_path("image_file_name") }
  it { is_expected.to have_json_path("image_content_type") }
  it { is_expected.to have_json_path("image_file_size") }
  it { is_expected.to have_json_path("image_updated_at") }
  it { is_expected.to have_json_path("invoice_id") }
  it { is_expected.to have_json_path("url") }
  it { is_expected.to have_json_path("image_url") }
  it { is_expected.to have_json_path("created_at") }
  it { is_expected.to have_json_path("updated_at") }

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
