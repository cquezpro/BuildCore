describe Api::V1::InvoicesIndexSerializer do

  before(:all) do
    @invoices = Invoice.all
  end

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::InvoicesIndexSerializer }
  let(:model) { @invoices }
  let(:options) { {root: false} }

  it { is_expected.to have_json_type(Array).at_path("need_information") }
  it { is_expected.to have_json_type(Array).at_path("ready_for_payment") }
  it { is_expected.to have_json_type(Array).at_path("payment_queue") }
  it { is_expected.to have_json_type(Array).at_path("recently_paid") }
  it { is_expected.to have_json_type(Array).at_path("in_process") }
  it { is_expected.to have_json_type(Array).at_path("archived") }
  it { is_expected.to have_json_type(Array).at_path("dispute") }
  it { is_expected.to have_json_type(Array).at_path("less_than_30") }
  it { is_expected.to have_json_type(Array).at_path("more_than_30") }
  it { is_expected.to have_json_type(Fixnum).at_path("total_count") }

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
