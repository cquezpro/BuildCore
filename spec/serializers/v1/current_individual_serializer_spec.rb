describe Api::V1::CurrentIndividualSerializer do

  before(:all) do
    qbc = build_stubbed :qb_class
    @user = build_stubbed :user, qb_classes: [qbc]
    @individual = build_stubbed :individual, user: @user, email: "someone@example.test"
  end

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::CurrentIndividualSerializer }
  let(:model) { @individual }
  let(:options) { {root: false} }

  it { is_expected.to be_json_eql(@user.id.to_json).at_path("user/id") }
  it { is_expected.to be_json_eql(@individual.id.to_json).at_path("id") }

  it { is_expected.to be_json_eql("someone@example.test".to_json).at_path("email") }

  it { is_expected.to have_json_type(String).at_path("name") }

  it { is_expected.to have_json_type(Array).at_path("user/qb_classes") }
  it { is_expected.to have_json_path("user/qb_classes/0/qb_id") }

  it { is_expected.to have_json_type(Array).at_path("user/liability_accounts") }
  it { is_expected.to have_json_type(Array).at_path("user/expense_accounts") }
  it { is_expected.to have_json_type(Array).at_path("user/bank_accounts") }
  it { is_expected.to have_json_type(Array).at_path("user/numbers") }
  it { is_expected.to have_json_type(Array).at_path("user/all_addresses") }
  it { is_expected.to have_json_type(Array).at_path("permissions") }

  it { is_expected.to have_json_path("user/invite_code") }
  it { is_expected.to have_json_path("user/mobile_phone") }
  it { is_expected.to have_json_path("user/routing_number") }
  it { is_expected.to have_json_path("user/bank_account_number") }
  it { is_expected.to have_json_path("user/created_at") }
  it { is_expected.to have_json_path("user/updated_at") }
  it { is_expected.to have_json_path("user/default_due_date") }
  it { is_expected.to have_json_path("user/timezone") }
  it { is_expected.to have_json_path("user/business_name") }
  it { is_expected.to have_json_path("user/business_type") }
  it { is_expected.to have_json_path("user/billing_address1") }
  it { is_expected.to have_json_path("user/billing_address2") }
  it { is_expected.to have_json_path("user/billing_city") }
  it { is_expected.to have_json_path("user/billing_state") }
  it { is_expected.to have_json_path("user/billing_zip") }
  it { is_expected.to have_json_path("user/qb_token") }
  it { is_expected.to have_json_path("user/qb_secret") }
  it { is_expected.to have_json_path("user/realm_id") }
  it { is_expected.to have_json_path("user/token_expires_at") }
  it { is_expected.to have_json_path("user/reconnect_token_at") }
  it { is_expected.to have_json_path("user/check_number") }
  it { is_expected.to have_json_path("user/liability_account_id") }
  it { is_expected.to have_json_path("user/expense_account_id") }
  it { is_expected.to have_json_path("user/terms_of_service") }
  it { is_expected.to have_json_path("user/bank_account_id") }
  it { is_expected.to have_json_path("user/sms_time") }
  it { is_expected.to have_json_path("user/pay_bills_through_text") }
  it { is_expected.to have_json_path("user/date_before_check_sent") }
  it { is_expected.to have_json_path("user/first_bill_added") }
  it { is_expected.to have_json_path("user/pay_first_bill") }
  it { is_expected.to have_json_path("user/modal_used") }
  it { is_expected.to have_json_path("user/locations_feature") }
  it { is_expected.to have_json_path("user/default_class_id") }
  it { is_expected.to have_json_path("user/valid_user") }
  it { is_expected.to have_json_path("user/has_mobile_number") }
  it { is_expected.to have_json_path("user/has_email") }
  it { is_expected.to have_json_path("user/has_bills") }
  it { is_expected.to have_json_path("user/confirmed_email") }
  it { is_expected.to have_json_path("user/has_autopay") }
  it { is_expected.to have_json_path("user/intuit_authentication") }

  it { is_expected.to have_json_path("email_new_invoice_onchange") }
  it { is_expected.to have_json_path("email_new_invoice_daily") }
  it { is_expected.to have_json_path("email_new_invoice_weekly") }
  it { is_expected.to have_json_path("email_new_invoice_none") }
  it { is_expected.to have_json_path("email_change_invoice_onchange") }
  it { is_expected.to have_json_path("email_change_invoice_daily") }
  it { is_expected.to have_json_path("email_change_invoice_weekly") }
  it { is_expected.to have_json_path("email_change_invoice_none") }
  it { is_expected.to have_json_path("email_paid_invoice_onchange") }
  it { is_expected.to have_json_path("email_paid_invoice_daily") }
  it { is_expected.to have_json_path("email_paid_invoice_weekly") }
  it { is_expected.to have_json_path("email_paid_invoice_none") }
  it { is_expected.to have_json_path("email_savings_onchange") }
  it { is_expected.to have_json_path("email_savings_daily") }
  it { is_expected.to have_json_path("email_savings_invoice_weekly") }
  it { is_expected.to have_json_path("email_savings_invoice_none") }
  it { is_expected.to have_json_path("text_new_invoice_onchange") }
  it { is_expected.to have_json_path("text_new_invoice_daily") }
  it { is_expected.to have_json_path("text_new_invoice_weekly") }
  it { is_expected.to have_json_path("text_new_invoice_none") }
  it { is_expected.to have_json_path("text_change_invoice_onchange") }
  it { is_expected.to have_json_path("text_change_invoice_daily") }
  it { is_expected.to have_json_path("text_change_invoice_weekly") }
  it { is_expected.to have_json_path("text_change_invoice_none") }
  it { is_expected.to have_json_path("text_paid_invoice_onchange") }
  it { is_expected.to have_json_path("text_paid_invoice_daily") }
  it { is_expected.to have_json_path("text_paid_invoice_weekly") }
  it { is_expected.to have_json_path("text_paid_invoice_none") }
  it { is_expected.to have_json_path("text_savings_onchange") }
  it { is_expected.to have_json_path("text_savings_daily") }
  it { is_expected.to have_json_path("text_savings_invoice_weekly") }
  it { is_expected.to have_json_path("text_savings_invoice_none") }

  it { is_expected.to have_json_path("role_id") }
  it { is_expected.to have_json_path("limit_min") }
  it { is_expected.to have_json_path("limit_max") }

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
