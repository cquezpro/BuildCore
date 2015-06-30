describe Mturk::Addresses::Comparator, :vcr do
  let(:invoice) { create(:invoice)}
  let!(:hit) { create(:hit, hit_type: :for_address, invoice: invoice) }
  let(:comparator) { Mturk::Addresses::Comparator.new(invoice) }


  context "comparing two Addresses" do
    describe "#run!" do

      context "when address match" do
        let!(:addresses) { create_list(:address, 2, created_by: :by_worker, name: 'Same name', address1: 'Same address1') }

        before(:each) do
          addresses.each do |address|
            address.update_attributes(addressable: invoice)
          end
        end

        it "updates the invoice address" do
          comparator.run!
          invoice.reload
          expect(invoice.address_id).not_to eq(nil)
          expect(invoice.ship_to_address.name).to eq("Same name")
        end

      end

      context "when address doesn't match" do
        let!(:addresses) { create_list(:address, 2, created_by: :by_worker) }
        let(:new_address) { create(:address, name: addresses.first.name, address1: addresses.first.address1, created_by: :by_worker)}

        before(:each) do
          addresses.each do |address|
            address.update_attributes(addressable: invoice)
          end
        end

        it "doesn't update the invoice" do
          comparator.run!
          invoice.reload
          expect(invoice.address_id).to eq(nil)
          expect(invoice.ship_to_address).to eq(nil)
        end

        it "updates the invoice if match" do
          new_address.update_attributes(addressable: invoice)
          comparator.run!
          invoice.reload
          expect(invoice.addresses.count).to eq(3)
          expect(invoice.address_id).not_to eq(nil)
          expect(invoice.ship_to_address).not_to eq(nil)
        end

        it "doesn't update the invoice even without match" do
          invoice.addresses << create(:address, created_by: :by_worker)
          comparator.run!
          invoice.reload
          expect(invoice.address_id).not_to eq(nil)
          expect(invoice.ship_to_address).not_to eq(nil)
        end
      end

    end

  end
end
