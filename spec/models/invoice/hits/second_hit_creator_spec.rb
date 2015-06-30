describe Hits::SecondHitCreator do
  let(:invoice) { create(:invoice) }

  context "creates a hit and a new invoice moderation" do

    context "when amount due doesn't match" do
      let!(:im1) { create(:im_first_review, invoice: invoice) }
      let!(:im2) { create(:im_first_review, invoice: invoice)}
      let(:second_hit) { Hits::SecondHitCreator.new(invoice: invoice) }
      it { expect(second_hit.save).to be true }

      it { expect { second_hit.save } .to change{ Hit.count }.by(1) }

      context ".save" do
        before(:each) { second_hit.save }

        it { expect(invoice.hits.second_review.count).to eq(1) }
        it { expect(second_hit.second_review?).to be true }
        it { expect(second_hit.invoice_moderations.count).to eq(1) }

        it "creates a hit a second review" do
          expect(invoice.invoice_moderations.count).to eql(3)
          expect(second_hit.id).to eq(invoice.invoice_moderations.second_review.last.hit.id)
        end
      end
    end


    context "when vendor doesn't match" do
      let!(:im1) { create(:im_first_review, invoice: invoice) }
      let!(:im2) { create(:im_first_review, invoice: invoice)}
      let(:second_hit) { Hits::SecondHitCreator.new(invoice: invoice) }

      it { expect(second_hit.save).to be true }

      context ".save" do
        before(:each) { second_hit.save }

        it { expect(invoice.hits.second_review.count).to eq(1) }
        it { expect(second_hit.second_review?).to be true }
        it { expect(second_hit.id).to eq(invoice.invoice_moderations.second_review.last.hit.id) }
        it { expect(second_hit.invoice_moderations.count).to eq(1) }

        it "creates a hit a second review" do
          expect(invoice.invoice_moderations.count).to eql(3)
          expect(invoice.hits.first_review.first).to eq(invoice.invoice_moderations.first.hit)
        end
      end
    end
  end
end
