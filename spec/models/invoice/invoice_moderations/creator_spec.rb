describe InvoiceModerations::ModerationCreator do

  describe "creating invoices" do
    let(:hit)     { create(:hit) }
    let(:vendor)  { create(:vendor, address1: 'Random Address 123')}
    let(:invoice) { create(:invoice, vendor: vendor) }


      context "#create_two!" do
        before(:each) { invoice.hits << hit }

        let(:creator) { InvoiceModerations::ModerationCreator.create_two!(invoice, invoice.hits.first) }
        let(:im_1)    { creator.first }

        it "create two invoice moderations" do
          expect{InvoiceModerations::ModerationCreator.create_two!(invoice, invoice.hits.first)}.to change{InvoiceModeration.count}.by 2
        end

        it "copy the vendors attributtes" do
          [:name, :address1, :address2, :city, :state, :zip].each do |attribute|
            expect(im_1.send(attribute)).to eql(vendor.send(attribute))
          end
        end
      end
  end
end
