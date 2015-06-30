describe Api::V1::VendorSerializer do

  # this factory is very slow
  before(:all) do
    @vendor = build_stubbed :vendor
    @role_no_terms = build_stubbed :role, permissions: [Permission["read_accounting-Vendor"]]
    @role_no_accounting = build_stubbed :role, permissions: [Permission["read_terms-Vendor"]]
    @ability_admin = Ability.new build_stubbed :individual
    @ability_no_terms = Ability.new build_stubbed :individual, role: @role_no_terms
    @ability_no_accounting = Ability.new build_stubbed :individual, role: @role_no_accounting
  end

  subject do
    serializer_class.new(model, options).to_json
  end

  let(:serializer_class) { Api::V1::VendorSerializer }
  let(:model) { @vendor }
  let(:ability) { @ability_admin }
  let(:options) { {root: false, scope: ability} }

  it { is_expected.to have_json_type(Integer).at_path("id") }

  it { is_expected.to have_json_type(Array).at_path("vendor_invoices/archived") }
  it { is_expected.to have_json_type(Array).at_path("vendor_invoices/less_than_30") }
  it { is_expected.to have_json_type(Array).at_path("vendor_invoices/more_than_30") }
  it { is_expected.to have_json_type(Integer).at_path("vendor_invoices/total_count") }

  it { is_expected.to have_json_type(Array).at_path("liability_accounts") }
  it { is_expected.to have_json_type(Array).at_path("expense_accounts") }
  it { is_expected.to have_json_type(Array).at_path("childrens") }
  it { is_expected.to have_json_type(Array).at_path("archived_invoices") }
  it { is_expected.to have_json_type(Array).at_path("line_items") }

  it { is_expected.to have_json_path("id") }
  it { is_expected.to have_json_path("user_id") }
  it { is_expected.to have_json_path("default_class") }
  it { is_expected.to have_json_path("name") }
  it { is_expected.to have_json_path("address1") }
  it { is_expected.to have_json_path("address2") }
  it { is_expected.to have_json_path("address3") }
  it { is_expected.to have_json_path("city") }
  it { is_expected.to have_json_path("state") }
  it { is_expected.to have_json_path("zip") }
  it { is_expected.to have_json_path("country") }
  it { is_expected.to have_json_path("fax_number") }
  it { is_expected.to have_json_path("cell_number") }
  it { is_expected.to have_json_path("email") }
  it { is_expected.to have_json_path("tax_id_number") }
  it { is_expected.to have_json_path("after_bill_date") }
  it { is_expected.to have_json_path("before_due_date") }
  it { is_expected.to have_json_path("after_due_date") }
  it { is_expected.to have_json_path("day_of_the_month") }
  it { is_expected.to have_json_path("after_recieved") }
  it { is_expected.to have_json_path("auto_amount") }
  it { is_expected.to have_json_path("end_after_payments") }
  it { is_expected.to have_json_path("end_autopay_over_amount") }
  it { is_expected.to have_json_path("alert_over") }
  it { is_expected.to have_json_path("created_at") }
  it { is_expected.to have_json_path("updated_at") }
  it { is_expected.to have_json_path("contact_person") }
  it { is_expected.to have_json_path("business_number") }
  it { is_expected.to have_json_path("payment_end_exceed") }
  it { is_expected.to have_json_path("payment_end_payments") }
  it { is_expected.to have_json_path("payment_end_date") }
  it { is_expected.to have_json_path("payment_amount_fixed") }
  it { is_expected.to have_json_path("pay_day") }
  it { is_expected.to have_json_path("payment_date") }
  it { is_expected.to have_json_path("payment_term") }
  it { is_expected.to have_json_path("payment_end") }
  it { is_expected.to have_json_path("payment_amount") }
  it { is_expected.to have_json_path("routing_number") }
  it { is_expected.to have_json_path("bank_account_number") }
  it { is_expected.to have_json_path("created_by") }
  it { is_expected.to have_json_path("sync_token") }
  it { is_expected.to have_json_path("qb_id") }
  it { is_expected.to have_json_path("qb_account_number") }
  it { is_expected.to have_json_path("liability_account_id") }
  it { is_expected.to have_json_path("expense_account_id") }
  it { is_expected.to have_json_path("auto_pay_weekly") }
  it { is_expected.to have_json_path("payment_end_if_alert") }
  it { is_expected.to have_json_path("payment_status") }
  it { is_expected.to have_json_path("keep_due_date") }
  it { is_expected.to have_json_path("default_qb_class_id") }
  it { is_expected.to have_json_path("parent_id") }
  it { is_expected.to have_json_path("source") }
  it { is_expected.to have_json_path("less_than_30_sum") }
  it { is_expected.to have_json_path("more_than_30_sum") }
  it { is_expected.to have_json_path("invoices_count") }
  it { is_expected.to have_json_path("humanized_payment_status") }
  it { is_expected.to have_json_path("formated_vendor") }
  it { is_expected.to have_json_path("total_outstanding") }

  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_total_text") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_total_email") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_total_flag") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_item_text") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_item_email") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_item_flag") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_itemqty_text") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_itemqty_email") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_itemqty_flag") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_itemprice_text") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_itemprice_email") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_itemprice_flag") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_duplicate_invoice_text") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_duplicate_invoice_email") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_duplicate_invoice_flag") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_marked_through_text") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_marked_through_email") }
  it {pending "Disable untill n+1 is fixed"; is_expected.to have_json_path("alert_marked_through_flag") }

  context "for individual who should not see accounting tab" do
    let(:ability) { @ability_no_accounting }

    it { is_expected.not_to have_json_path("liability_account_id") }
    it { is_expected.not_to have_json_path("liability_account") }
    it { is_expected.not_to have_json_path("expense_account_id") }
    it { is_expected.not_to have_json_path("expense_account") }
    it { is_expected.not_to have_json_path("default_qb_class_id") }
    it { is_expected.not_to have_json_path("default_qb_class") }
  end

  context "for individual who should not see terms tab" do
    let(:ability) { @ability_no_terms }

    it { is_expected.not_to have_json_path("keep_due_date") }
    it { is_expected.not_to have_json_path("payment_term") }
    it { is_expected.not_to have_json_path("after_recieved") }
    it { is_expected.not_to have_json_path("day_of_the_month") }
    it { is_expected.not_to have_json_path("auto_pay_weekly") }
    it { is_expected.not_to have_json_path("before_due_date") }
    it { is_expected.not_to have_json_path("after_due_date") }
    it { is_expected.not_to have_json_path("payment_status") }
    it { is_expected.not_to have_json_path("payment_end_if_alert") }
    it { is_expected.not_to have_json_path("payment_end") }
    it { is_expected.not_to have_json_path("payment_end_exceed") }
    it { is_expected.not_to have_json_path("payment_end_payments") }
    it { is_expected.not_to have_json_path("payment_date") }
    it { is_expected.not_to have_json_path("payment_amount") }
    it { is_expected.not_to have_json_path("payment_amount_fixed") }
  end

  it "may not contain key which name contains \"crypted\"" do
    expect(JSON.parse(subject).keys.map(&:to_s).grep(/crypted/)).to be_empty
  end

  it "inherits from CoreSerializer defined in its namespace" do
    expected_superclass = serializer_class.name.gsub(/::\w+\Z/, "::CoreSerializer").constantize
    expect(serializer_class.ancestors).to include(expected_superclass)
  end

end
