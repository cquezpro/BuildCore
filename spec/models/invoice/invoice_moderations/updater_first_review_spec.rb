describe InvoiceModerations::UpdaterFirstReview do

  describe "validations" do
    let(:invoice_moderation) { create(:im_first_review) }
    let(:vendor) { Vendor.find(invoice_moderation.vendor_id) }

    it { is_expected.to validate_presence_of(:mt_assignment_id) }
    it { is_expected.to validate_presence_of(:mt_hit_id) }
    it { is_expected.to validate_presence_of(:mt_worker_id) }

    # it "creates a vendor if it can't find it" do
    #   expect(vendor.user).to eq(invoice_moderation.invoice.user)
    #   expect(invoice_moderation.vendor_id).not_to eq(nil)
    #   expect(invoice_moderation.vendor_id).to eq(vendor.id)
    #   expect(vendor.id).to eq(invoice_moderation.vendor_id)
    #   expect(vendor.name).to eq(invoice_moderation.name)
    # end
  end
end
