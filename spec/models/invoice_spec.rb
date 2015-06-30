describe Invoice do
  it { is_expected.to belong_to(:user) }
  it { is_expected.to belong_to(:vendor) }
  it { is_expected.to have_many(:uploads) }
  it { is_expected.to have_many(:invoice_transactions) }

  it { is_expected.to have_many(:approvals) }
  it { is_expected.to belong_to(:expense_account) }
  it { is_expected.to belong_to(:qb_class) }

  describe "updating from invoice moderations" do
    let(:invoice) { create(:invoice, account_number: "007") }
    let(:invoice_moderations) { create_list(:invoice_moderation, 2, invoice: invoice, vendor_id: invoice.vendor.id) }

    describe "#set_fields_from_invoice_moderation" do
      before(:each) do
        invoice.selected_invoice_moderation = invoice_moderations.first
        invoice.set_fields_from_invoice_moderation
        invoice.save
      end

      it "updates the fields" do
        expect(invoice.number).not_to eql(invoice_moderations.first.number)
        [:amount_due, :vendor_id, :tax].each do |field|
          expect(invoice.send(field)).to eq(invoice_moderations.first.send(field))
        end
      end

      it "doesn't update already filled fields" do
        expect(invoice.number).to eql("12345")
        expect(invoice.account_number).to eql("007")
      end
    end
  end

  describe "#amount_due_missing?" do
    example{ expect(build(:invoice, amount_due: 0)).to be_amount_due_missing }
    example{ expect(build(:invoice, amount_due: nil)).to be_amount_due_missing }
    example{ expect(build(:invoice, amount_due: 10)).not_to be_amount_due_missing }
  end

  describe "#approve_by" do
    let(:approver){ create :individual }
    let(:invoice){ create :invoice }

    it "creates new approval entry for invoice" do
      expect {
        invoice.approve_by approver, :regular
      }.to change { invoice.approvals(true).count }
    end
  end

  # describe "#update_expense_account" do
  #   let(:invoice) { create :invoice }
  #   let(:materials_account) { create :expense_account }
  #   let(:equipment_account) { create :expense_account }

  #   before do
  #     create :line_item, invoice: invoice, expense_account: materials_account, total: 100
  #     create :line_item, invoice: invoice, expense_account: materials_account, total:  10
  #     create :line_item, invoice: invoice, expense_account: equipment_account, total:  80
  #     create :line_item, invoice: invoice, expense_account: equipment_account, total:  60
  #   end

  #   it "assigns the most valued expense account" do
  #     invoice.update_expense_account
  #     expect(invoice.reload.expense_account).to eq(equipment_account)
  #   end
  # end

  # Hit a loop
  # describe "#update_qb_class" do
  #   let(:invoice) { create :invoice, has_items: true }
  #   let(:location_denver) { create :qb_class }
  #   let(:location_dallas) { create :qb_class }

  #   before do
  #     create :line_item, invoice: invoice, qb_class: location_denver, total: 100
  #     create :line_item, invoice: invoice, qb_class: location_denver, total:  10
  #     create :line_item, invoice: invoice, qb_class: location_dallas, total:  80
  #     create :line_item, invoice: invoice, qb_class: location_dallas, total:  60
  #   end

  #   it "assigns the most valued QB class" do
  #     invoice.update_qb_class
  #     expect(invoice.reload.qb_class).to eq(location_dallas)
  #   end
  # end

  describe "#recalculate_due_date" do
    describe "vendor#pay_after_bill_received should set the due to the day defined" do
      let(:vendor) { create(:vendor, payment_term: :pay_after_bill_received, after_recieved: 10, payment_status: :autopay, day_of_the_month: 1) }
      let(:vendor_two) { create(:vendor, payment_term: :pay_after_bill_received, after_recieved: 10, payment_status: :autopay, day_of_the_month: 1) }

      let(:invoice) { create(:invoice, amount_due: 32123, vendor: vendor, date: Date.today) }
      let(:invoice_two) { create(:invoice, amount_due: 32123, vendor: vendor_two, date: Date.yesterday, status: 4) }
      let(:invoice_three) { create(:invoice, vendor: vendor_two, date: Date.tomorrow) }

      it "sets the correct due date on creation" do
        expect(invoice.due_date).to eq(10.business_day.after(Date.today).to_date)
      end

      it "can't be nil" do
        [invoice, invoice_two, invoice_three].each do |i|
          expect(i.due_date).not_to eq(nil)
        end
      end

      it "when attribute is changed it changes invoices date" do
        invoice_two.update_column(:due_date, nil)
        invoice_three.update_column(:due_date, nil)
        expect(invoice_two.recalculate_due_date).to eq(10.business_day.after(Date.yesterday).to_date)
        expect(invoice_three.recalculate_due_date).to eq(10.business_day.after(Date.tomorrow).to_date)
      end

    end

    describe "vendor#pay_day_of_month_date should set the due to the day defined" do
      let!(:today) { Date.today }
      let(:fake_date) { Date.new(today.year, test_month, 25) }

      let(:vendor) { create(:vendor, payment_term: :pay_day_of_month, after_recieved: 10, payment_status: :autopay, day_of_the_month: 31) }
      let(:vendor_two) { create(:vendor, payment_term: :pay_day_of_month, after_recieved: 10, payment_status: :autopay, day_of_the_month: 30) }

      describe "on juanuary" do
        let(:test_month) { 2 }
        let(:invoice) { create(:invoice, amount_due: 32123, vendor: vendor) }
        let(:invoice_two) { create(:invoice, amount_due: 32123, vendor: vendor, status: 4) }
        let(:invoice_three) { create(:invoice, vendor: vendor) }

        before do
          allow(Date).to receive(:today).and_return(fake_date)
          allow(Date).to receive(:current).and_return(fake_date)
        end

        it "sets the date to 28" do
          expect(invoice.due_date.day).to eq(28)
          expect(invoice_two.due_date.day).to eq(28)
          expect(invoice_three.due_date.day).to eq(28)
        end
      end

      describe "on june" do
        let(:test_month) { 6 }
        let(:invoice) { create(:invoice, amount_due: 32123, vendor: vendor, date: Date.today) }
        let(:invoice_two) { create(:invoice, amount_due: 32123, vendor: vendor, date: Date.yesterday, status: 4) }
        let(:invoice_three) { create(:invoice, vendor: vendor, date: Date.tomorrow) }

        before do
          allow(Date).to receive(:today).and_return(fake_date)
          allow(Date).to receive(:current).and_return(fake_date)
        end


        it "sets the date to 28" do
          expect(invoice.due_date.day).to eq(30)
          expect(invoice_two.due_date.day).to eq(30)
          expect(invoice_three.due_date.day).to eq(30)
        end

        it "can't be nil" do
          vendor_two.update_attributes(payment_term: :pay_after_bill_received)
          [invoice, invoice_two, invoice_three].each do |i|
            expect(i.due_date).not_to eq(nil)
          end
        end
      end
    end

    describe "vendor#pay_before_due_date should set the due to the day defined" do
      let(:vendor) { create(:vendor, payment_term: :pay_before_due_date, payment_status: :autopay, before_due_date: 5) }
      let(:vendor_two) { create(:vendor, payment_term: :pay_before_due_date, payment_status: :autopay, before_due_date: 0) }

      let(:invoice) { create(:invoice, amount_due: 32123, vendor: vendor, date: Date.today, due_date: 10.days.ago) }
      let(:invoice_two) { create(:invoice, amount_due: 32123, vendor: vendor_two, date: Date.yesterday, status: 4, due_date: Date.yesterday) }
      let(:invoice_three) { create(:invoice, vendor: vendor_two, date: nil) }

      it "sets the correct due date on creation" do
        expect(invoice.deferred_date).to eq(5.business_day.before(10.days.ago).to_date)
        # byebug
        expect(invoice_two.deferred_date).to eq(invoice_two.due_date)
        expect(invoice_three.deferred_date).to eq(invoice.created_at.to_date)
      end

      it "can't be nil" do
        [invoice, invoice_two, invoice_three].each do |i|
          expect(i.deferred_date).not_to eq(nil)
        end
      end
    end

    describe "vendor#pay_after_due_date should set the due to the day defined" do
      let(:vendor) { create(:vendor, payment_term: :pay_after_due_date, payment_status: :autopay, after_due_date: 5) }
      let(:vendor_two) { create(:vendor, payment_term: :pay_after_due_date, payment_status: :autopay, after_due_date: 0) }

      let(:invoice) { create(:invoice, amount_due: 32123, vendor: vendor, date: Date.today, due_date: 10.days.ago) }
      let(:invoice_two) { create(:invoice, amount_due: 32123, vendor: vendor_two, date: Date.yesterday, status: 4, due_date: Date.yesterday) }
      let(:invoice_three) { create(:invoice, vendor: vendor_two, date: nil) }

      it "sets the correct due date on creation" do
        expect(invoice.deferred_date).to eq(5.business_day.after(10.days.ago).to_date)
        expect(invoice_three.deferred_date).to eq(invoice.created_at.to_date)
      end

      it "can't be nil" do
        [invoice, invoice_two, invoice_three].each do |i|
          expect(i.deferred_date).not_to eq(nil)
        end
      end
    end
  end
end
