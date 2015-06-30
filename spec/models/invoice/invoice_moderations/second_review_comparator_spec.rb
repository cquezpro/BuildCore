describe InvoiceModerations::SecondReviewComparator, :vcr do

  context "Updates the invoice when find a match" do

    context "for amount due" do
      let(:invoice)    { create(:invoice, pdf_total_pages: 1, status: 2) }
      let!(:invoice_pages) { create_list(:invoice_page, 2, invoice: invoice)}
      let(:hit)        { create(:hit)                                                      }
      let(:hit_2)      { create(:hit)                                                      }
      let!(:im_1)      { create(:im_first_review, invoice: invoice, hit: hit)              }
      let!(:im_2)      { create(:im_first_review, invoice: invoice, amount_due: 12345, hit: hit) }
      let!(:im_3)      { create(:im_second_review, invoice: invoice, amount_due: 12345, hit: hit_2) }
      let(:comparator) { InvoiceModerations::SecondReviewComparator.build_from(invoice)    }

      it "updates the invoice with the workers match" do
        comparator.run!
        expect(invoice.reload.amount_due).not_to eq(im_1.amount_due)
        expect(invoice.reload.amount_due).to eq(im_3.amount_due)
        expect(invoice.reload.amount_due).to eq(im_2.amount_due)
      end
    end

    describe "for vendor" do
      let(:invoice)     { create(:invoice, :without_vendor, amount_due: 300.25, pdf_total_pages: 1) }
      let!(:invoice_pages) { create_list(:invoice_page, 2, invoice: invoice)}
      let(:hit)         { create(:hit) }
      let(:hit_2)       { create(:hit) }
      let!(:im_1)       { create(:im_first_review, invoice: invoice, hit: hit) }
      let!(:im_2)       { create(:im_first_review, invoice: invoice, hit: hit, name: 'Same Vendor!') }
      let(:comparator)  { InvoiceModerations::SecondReviewComparator.build_from(invoice) }

      before(:each) { invoice.update_column(:status, 2) }

      describe "no match in database but match in workers" do
        let!(:im_3)       { create(:im_second_review, invoice: invoice, hit: hit_2, name: 'Same Vendor!') }

        before(:each) { invoice.in_process! }

        it { expect(invoice.vendor_id).to be(nil) }

        it "updates the invoice with the workers match" do
          # byebug
          comparator.run!
          expect(invoice.reload.vendor).not_to eq(nil)
          expect(invoice.reload.vendor.name).not_to eq(im_1.reload.name)
          expect(invoice.reload.vendor.name).to eq(im_2.name)
          expect(invoice.reload.vendor.name).to eq(im_3.name)
        end
      end

      describe "with match in database" do
        let!(:vendor) { create(:vendor, name: "Same Vendor!", user: invoice.user) }
        let!(:im_3) { create(:im_second_review, invoice: invoice, hit: hit_2, name: 'Same Vendorz!') }
        before(:each) do
          im_1.update_attributes(address1: "ad1", city: "no cit", name: "Any vendor")
        end

        it "updates the invoice with workers match" do
          expect{ comparator.run! }.to change{ Hit.count }.by(1)
          invoice.reload
          im_2.reload

          expect(invoice.vendor_id).not_to eq(im_1.vendor_id)
          expect(invoice.vendor.name).to eq(im_2.name)
          expect(invoice.hits.for_line_item.count).to eq(1)
        end

      end

    end
  end
end
