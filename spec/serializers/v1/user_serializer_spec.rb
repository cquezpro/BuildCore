describe Api::V1::UserSerializer do

  before(:all) do
    qbc = build_stubbed :qb_class
    @user = build_stubbed :user, qb_classes: [qbc]
  end

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::UserSerializer }
  let(:model) { @user }
  let(:options) { {root: false} }

  it { is_expected.to have_json_type(Integer).at_path("id") }

  it { is_expected.to have_json_type(Array).at_path("qb_classes") }
  it { is_expected.to have_json_path("qb_classes/0/qb_id") }

  it { is_expected.to have_json_type(Array).at_path("liability_accounts") }
  it { is_expected.to have_json_type(Array).at_path("expense_accounts") }
  it { is_expected.to have_json_type(Array).at_path("bank_accounts") }
  it { is_expected.to have_json_type(Array).at_path("numbers") }
  it { is_expected.to have_json_type(Array).at_path("all_addresses") }

  it { is_expected.to have_json_path("invite_code") }
  it { is_expected.to have_json_path("mobile_phone") }
  it { is_expected.to have_json_path("routing_number") }
  it { is_expected.to have_json_path("bank_account_number") }
  it { is_expected.to have_json_path("created_at") }
  it { is_expected.to have_json_path("updated_at") }
  it { is_expected.to have_json_path("default_due_date") }
  it { is_expected.to have_json_path("timezone") }
  it { is_expected.to have_json_path("business_name") }
  it { is_expected.to have_json_path("business_type") }
  it { is_expected.to have_json_path("billing_address1") }
  it { is_expected.to have_json_path("billing_address2") }
  it { is_expected.to have_json_path("billing_city") }
  it { is_expected.to have_json_path("billing_state") }
  it { is_expected.to have_json_path("billing_zip") }
  it { is_expected.to have_json_path("qb_token") }
  it { is_expected.to have_json_path("qb_secret") }
  it { is_expected.to have_json_path("realm_id") }
  it { is_expected.to have_json_path("token_expires_at") }
  it { is_expected.to have_json_path("reconnect_token_at") }
  it { is_expected.to have_json_path("check_number") }
  it { is_expected.to have_json_path("liability_account_id") }
  it { is_expected.to have_json_path("expense_account_id") }
  it { is_expected.to have_json_path("terms_of_service") }
  it { is_expected.to have_json_path("bank_account_id") }
  it { is_expected.to have_json_path("sms_time") }
  it { is_expected.to have_json_path("pay_bills_through_text") }
  it { is_expected.to have_json_path("date_before_check_sent") }
  it { is_expected.to have_json_path("first_bill_added") }
  it { is_expected.to have_json_path("pay_first_bill") }
  it { is_expected.to have_json_path("modal_used") }
  it { is_expected.to have_json_path("locations_feature") }
  it { is_expected.to have_json_path("default_class_id") }
  it { is_expected.to have_json_path("valid_user") }
  it { is_expected.to have_json_path("has_mobile_number") }
  it { is_expected.to have_json_path("has_email") }
  it { is_expected.to have_json_path("has_bills") }
  it { is_expected.to have_json_path("confirmed_email") }
  it { is_expected.to have_json_path("has_autopay") }
  it { is_expected.to have_json_path("intuit_authentication") }

  it "may not contain key which name contains \"password\"" do
    expect(JSON.parse(subject).keys.map(&:to_s).grep(/password/)).to be_empty
  end

  it "may not contain key which name contains \"crypted\"" do
    expect(JSON.parse(subject).keys.map(&:to_s).grep(/crypted/)).to be_empty
  end

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
