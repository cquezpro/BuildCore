describe Mturk::Surveys::Creator, :vcr do
  let(:hit) { create(:hit, hit_type: :for_survey) }
  let(:invoice) { create(:invoice, status: 1, survey_hit: hit, vendor: nil, number: nil) }
  let(:comparator) { Mturk::Surveys::Comparator.new(invoice) }


  context "comparing two surveys" do

    describe "#run!" do
      before(:each) do
        create_list(:invoice_page, 2, invoice: invoice)
        invoice.update_column(:status, 1)
      end

      context "when is invoice and marked through" do
        let!(:surveys) { create_list(:survey, 2, is_invoice: true, is_marked_through: true, invoice: invoice)}

        it { expect{ comparator.run! }.to change{ invoice.is_invoice } }
        it { expect{ comparator.run! }.to change { invoice.is_marked_through } }

        it "set the invoice on status in process" do
          comparator.run!
          expect(invoice.in_process?).to eq true
        end

        it "creates a marked through hit" do
          expect{ comparator.run! }.to change { Hit.marked_through.count}.by(1)
        end
      end

      describe "#create_location_hit_if_not_match" do
        let(:address) { create(:address) }

        context "when location match" do
          let!(:surveys) { create_list(:survey, 2, is_invoice: true, invoice: invoice, address_reference: address.id.to_s)}

          it "updates the invoice with matching address" do
            comparator.run!
            expect(invoice.ship_to_address).to eq(address)
          end
        end
      end

      context "when is not an invoice" do
        let!(:surveys) { create_list(:survey, 2, is_invoice: false, is_marked_through: true, invoice: invoice)}
        it { expect{comparator.run!}.to change{ invoice.status } }

        it "changes the status of the invoice to missing information" do
          expect(invoice.received?).to eq true
          comparator.run!
          expect(invoice.need_information?).to eq true
        end

        it "doesn't creates a marked through hit" do
          expect{ comparator.run! }.to change { Hit.first_review.count}.by(0)
        end
      end

    end

  end
end
