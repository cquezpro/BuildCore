describe Invoice::AsFirstReview do
  let(:hit) { create(:hit) }
  let(:invoice) { create(:invoice, has_items: true) }
  let(:invoice_moderation) { create(:invoice_moderation, invoice: invoice, hit: hit) }

  describe "validations" do
    it { is_expected.to validate_presence_of(:amount_due) }
    it { is_expected.to validate_presence_of(:vendor_id) }
  end

  describe "for vendors" do
    let!(:invoice) { create(:invoice, vendor: nil) }
    let!(:invoice_moderations) { create_list(:im_first_review, 2, invoice: invoice, hit: hit) }
    let(:updater) { Invoice::AsFirstReview.find(invoice.id) }

    before(:each) do
      invoice.update_attribute(:vendor_id, nil)
      invoice_moderations.each { |e| e.update_attribute(:vendor_id, create(:vendor).id) }
      updater.selected_invoice_moderation = invoice_moderations.first
      updater.set_fields_from_invoice_moderation
    end

    describe "on save" do
      before(:each) { updater.save }
      it { expect(invoice.reload.other_fee).not_to eq(nil) }
      it { expect(invoice.reload.other_fee).to eq(invoice_moderations.first.other_fee) }
    end

    it "updates the vendor from invoice moderation " do
      expect(invoice.reload.vendor_id).to be nil
      expect(updater.save).to be true
      expect(invoice.reload.vendor_id).to eq(invoice_moderations.first.vendor_id)
    end
  end
end
