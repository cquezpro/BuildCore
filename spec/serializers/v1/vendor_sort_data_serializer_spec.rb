describe Api::V1::VendorSortDataSerializer do

  before(:all) do
    @invoices = Invoice.all
  end

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::VendorSortDataSerializer }
  let(:model) { @invoices }
  let(:options) { {root: false} }

  it { is_expected.to have_json_type(Array).at_path("archived") }
  it { is_expected.to have_json_type(Array).at_path("less_than_30") }
  it { is_expected.to have_json_type(Array).at_path("more_than_30") }
  it { is_expected.to have_json_type(Fixnum).at_path("total_count") }

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
