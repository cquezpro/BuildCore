describe Invoice::AsSecondReview, :vcr do
  let(:invoice) { create(:invoice) }

  context "updating invoices" do

    describe "for amount_due" do
      let(:im_1) { create(:im_first_review, invoice: invoice) }
      let(:im_2) { create(:im_first_review, invoice: invoice, amount_due: 12345) }
      let(:im_3) { create(:im_second_review, invoice: invoice, amount_due: 12345) }

      before(:each) { im_1; im_2; im_3; }

      it "updates the amount_due from invoice moderations " do
        expect(invoice.amount_due).to be nil
        expect(Invoice::AsSecondReview.update_with(im_2, :amount_due)).to be true
        expect(invoice.reload.amount_due).to eq(im_2.amount_due)
      end
    end

    describe "for vendors" do
      let(:invoice) { create(:invoice, amount_due: 30) }
      let(:vendor)  { create(:vendor) }
      let!(:im_1) { create(:im_first_review, invoice: invoice) }
      let!(:im_2) { create(:im_first_review, invoice: invoice, name: vendor.name) }
      let!(:im_3) { create(:im_second_review, invoice: invoice, name: vendor.name) }

      before(:each) { invoice.update_attributes(vendor_id: nil); im_2.update_attribute(:vendor_id, 2); im_3.update_attribute(:vendor_id, 2) }

      it "creates the same vendor with same names from" do
        expect(im_2.vendor_id).to eq(im_3.vendor_id)
        expect(im_1.vendor_id).not_to eq(im_3.vendor_id)
      end
    end
  end
end
