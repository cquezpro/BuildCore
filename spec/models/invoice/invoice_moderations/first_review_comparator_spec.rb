describe InvoiceModerations::FirstReviewComparator, :vcr do
  let(:hit) { create(:hit) }

  describe "for amount due" do
    let!(:invoice) { create(:invoice, account_number: "007", vendor_present: true, amount_due_present: true, pdf_total_pages: 1) }
    let!(:invoice_pages) { create_list(:invoice_page, 2, invoice: invoice) }
    let!(:invoice_moderations) { create_list(:im_first_review, 2, invoice: invoice, amount_due: 123.40, name: 'Same Vendor!', vendor_id: nil, hit_id: hit.id) }
    let(:comparator) { InvoiceModerations::FirstReviewComparator.build_from(invoice) }

    it "returns true if the invoice moderations fields match each other" do
      expect(comparator.builder_vendor_match?).to be true
    end

    context "with matching invoices moderations" do
      it "updates the invoice if the fields match" do
        expect(invoice.amount_due).not_to eq(invoice_moderations.first.amount_due)
        expect(invoice.number).to eq('12345')
        expect(comparator.run!).to be true
        expect(invoice.reload.amount_due).to eq(invoice_moderations.first.amount_due)
      end
    end

    context "when amount due doesn't match" do
      it "creates a new invoice moderation and a new job" do
        invoice_moderations.first.update_attribute(:amount_due, 9292)
        expect {comparator.run!} .to change{Hit.count}.by 1
      end
    end
  end

  describe "for vendor" do
    let!(:invoice) { create(:invoice, :without_vendor, account_number: "007", vendor: nil, amount_due: 250, vendor_present: true, amount_due_present: true) }
    let!(:invoice_moderations) { create_list(:im_first_review, 2, invoice: invoice, name: "Same Vendor!", hit_id: hit.id) }

    let(:comparator) { InvoiceModerations::FirstReviewComparator.build_from(invoice) }

    before(:each) { invoice.update_attribute(:vendor_id, nil); invoice.in_process! }

    context "with matching invoices moderations" do

      it "returns true if the invoice moderations fields match each other" do
        invoice_moderations
        expect(comparator.builder_vendor_match?).to be true
      end

      it "updates the invoice if the fields match" do
        expect(comparator.builder_vendor_match?).to be true
        expect(invoice.reload.vendor_id).to be nil
        expect(invoice.number).to eq('12345')
        expect(comparator.run!).to be true
        expect(invoice.reload.vendor).not_to eq(nil)
      end
    end

    context "when vendor doesn't match" do
      before(:each) { invoice_moderations.first.update_attributes(city: 'test', vendor_id: nil); invoice.update_column(:status, 2) }

      it { expect(invoice.reload.vendor_id).to be nil }
      it { expect(comparator.vendor_match?).to be false }
      it { expect(comparator.builder_vendor_match?).to be false }
      it { expect { comparator.run! }.to change{ Hit.count }.by(1) }
      it "creates a new hit" do
        expect(invoice.reload.vendor_id).to be nil
      end

      it "creates a new invoice moderation" do
        expect(invoice.reload.vendor_id).to be nil
        expect { comparator.run! }.to change{ InvoiceModeration.count }.by(1)
      end
    end

    context "when vendor match agains database" do
      before(:each) { invoice_moderations.first.update_attributes(city: 'test', vendor_id: nil) }
      let!(:vendor) { create(:vendor, user: invoice.user, name: "Same Vendor!", address1: "Some address") }

      it { expect(comparator.vendor_match?).to eq(true) }
      it { expect(comparator.run!).to eq(true) }
      it "updated the invoice" do
        comparator.run!
        expect(invoice.reload.vendor).to eq(vendor)
      end
    end

    context "when vendor ids are the same" do
      let(:vendor) { create(:vendor) }
      let!(:invoice_moderations) { create_list(:im_first_review, 2, invoice: invoice, vendor_id: vendor.id, hit_id: hit.id) }

      it { expect(comparator.vendor_match?).to eq(true) }
      it { expect(comparator.run!).to eq(true) }
      it "updated the invoice" do
        comparator.run!
        expect(invoice.reload.vendor).to eq(vendor)
      end
    end
  end
end
