describe Api::V1::DilbertImageSerializer do

  before(:all) { @di = build_stubbed :dilbert_image_with_file_fixture, image_fixture: "Composition7_horizontal.jpg" }

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::DilbertImageSerializer }
  let(:model) { @di }
  let(:options) { {root: false} }

  it { is_expected.to have_json_path("id") } #:40
  it { is_expected.to have_json_type(String).at_path("title") } #:"title"
  it { is_expected.to have_json_path("link") } #:"http://dilbert.com/strips/"
  it { is_expected.to have_json_path("guid") } #:"http://dilbert.com/strips/comic/2015-01-12"
  it { is_expected.to have_json_path("publication_date") } #:"2015-01-12T01:21:01.000-05:00"
  it { is_expected.to have_json_path("description") } #:"Dilbert"
  it { is_expected.to have_json_path("original_image_url") } #:"http://dilbert.com/dyn/str_strip/000000000/00000000/0000000/200000/30000/7000/100/237186/237186.strip.zoom.gif"
  it { is_expected.to have_json_path("image_file_name") } #:"open-uri20150113-2-1hcyz07"
  it { is_expected.to have_json_path("image_content_type") } #:"image/gif"
  it { is_expected.to have_json_path("image_file_size") } #:119690,"image_updated_at":"2015-01-12T22:00:30.511-05:00"
  it { is_expected.to have_json_path("created_at") } #:"2015-01-12T22:00:30.553-05:00"
  it { is_expected.to have_json_path("updated_at") } #:"2015-01-12T22:00:30.553-05:00"
  it { is_expected.to have_json_path("local_image_url") } #:"https://billsync1.s3.amazonaws.com/dilbert_images/images/000/000/040/original/open-uri20150113-2-1hcyz07?1421118030"

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
