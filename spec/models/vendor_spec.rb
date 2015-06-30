describe Vendor do

  it { is_expected.to belong_to(:user) }
  it { is_expected.to have_many(:invoices) }
  it { is_expected.to have_many(:alert_settings) }
  it { is_expected.to define_enum_for(:payment_term) }

  # describe "defaults" do
  #   describe "#payment_terms" do
  #     describe "#pay_after_bill_received should set the due to the day defined" do
  #       let(:vendor) { create(:vendor, payment_term: :pay_after_bill_received, after_recieved: 14, payment_status: :autopay, day_of_the_month: 1) }
  #       let(:vendor_two) { create(:vendor, payment_term: :pay_day_of_month, after_recieved: 10, payment_status: :autopay, day_of_the_month: 1) }

  #       let(:invoice) { create(:invoice, amount_due: 32123, vendor: vendor, date: Date.today) }
  #       let(:invoice_two) { create(:invoice, amount_due: 32123, vendor: vendor_two, date: Date.yesterday, status: 4) }
  #       let(:invoice_three) { create(:invoice, vendor: vendor_two, date: Date.tomorrow) }

  #       it "sets the correct due date on creation" do
  #         expect(invoice.due_date).to eq(14.business_day.after(Date.today).to_date)
  #       end

  #       it "can't be nil" do
  #         vendor_two.update_attributes(payment_term: :pay_after_bill_received)
  #         [invoice, invoice_two, invoice_three].each do |i|
  #           expect(i.due_date).no_to eq(nil)
  #         end
  #       end

  #       it "when attribute is changed it changes invoices date" do
  #         invoice_two
  #         invoice_three

  #         vendor_two.update_attributes(payment_term: :pay_after_bill_received)
  #         # byebug
  #         expect(invoice_two.due_date).to eq(9.business_day.after(Date.today).to_date)
  #         expect(invoice_three.due_date).to eq(11.business_day.after(Date.today).to_date)
  #       end

  #     end
  #   end

  # end

end
