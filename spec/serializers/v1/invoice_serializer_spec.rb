describe Api::V1::InvoiceSerializer do

  include JsonSpec::Helpers

  before(:all) do
    @fixture_name = "Composition7_vertical.jpg"
    @invoice = create :invoice
    create :upload, :with_file_fixture, image_fixture: @fixture_name, invoice: @invoice
    item = create :line_item, vendor: @invoice.vendor
    create :invoice_transaction, line_item: item, invoice: @invoice
  end

  after(:all) do
    Invoice.delete_all
    Upload.delete_all
    LineItem.delete_all
    InvoiceTransaction.delete_all
  end

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::InvoiceSerializer }
  let(:model) { @invoice }
  let(:options) { {root: false} }

  it { is_expected.to have_json_type(Integer).at_path("id") }

  it { is_expected.to have_json_type(Array).at_path("invoice_transactions") }
  it { is_expected.to be_json_eql(model.invoice_transactions.first.id.to_s).at_path("invoice_transactions/0/id") }

  it { is_expected.to have_json_type(Array).at_path("total_alerts") }

  it { is_expected.to have_json_type(Array).at_path("uploaded_images") }
  it { is_expected.to have_json_type(Integer).at_path("uploaded_images/0/id") }
  it { is_expected.to have_json_type(String).at_path("uploaded_images/0/url") }
  example { expect(parse_json(subject, "uploaded_images/0/url")).to include(@fixture_name) }

  it { is_expected.to have_json_path("number") }
  it { is_expected.to have_json_path("vendor_id") }
  it { is_expected.to have_json_path("amount_due") }
  it { is_expected.to have_json_path("tax") }
  it { is_expected.to have_json_path("other_fee") }
  it { is_expected.to have_json_path("due_date") }
  it { is_expected.to have_json_path("resale_number") }
  it { is_expected.to have_json_path("account_number") }
  it { is_expected.to have_json_path("date") }
  it { is_expected.to have_json_path("invoice_total") }
  it { is_expected.to have_json_path("new_item") }
  it { is_expected.to have_json_path("line_item_quantity") }
  it { is_expected.to have_json_path("unit_price") }
  it { is_expected.to have_json_path("created_at") }
  it { is_expected.to have_json_path("updated_at") }
  it { is_expected.to have_json_path("user_id") }
  it { is_expected.to have_json_path("invoice_moderation") }
  it { is_expected.to have_json_path("reviewed") }
  it { is_expected.to have_json_path("payment_send_date") }
  it { is_expected.to have_json_path("payment_date") }
  it { is_expected.to have_json_path("act_by") }
  it { is_expected.to have_json_path("email_body") }
  it { is_expected.to have_json_path("paid_with") }
  it { is_expected.to have_json_path("status") }
  it { is_expected.to have_json_path("source") }
  it { is_expected.to have_json_path("check_number") }
  it { is_expected.to have_json_path("check_date") }
  it { is_expected.to have_json_path("pdf_url") }
  it { is_expected.to have_json_path("humanized_status") }
  it { is_expected.to have_json_path("comparation_humanized_status") }
  it { is_expected.to have_json_path("humanized_alert_text") }
  it { is_expected.to have_json_path("default_item") }

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
