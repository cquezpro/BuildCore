require 'rails_helper'

describe Mturk::Assignments::Creator do
  # describe "Validations" do
  #   it { is_expected.to validate_presence_of(:mt_assignment_id) }
  #   it { is_expected.to validate_presence_of(:hit) }
  #   it { is_expected.to validate_presence_of(:worker) }
  # end


  describe "builders" do
    describe "#build_from" do
      let(:invoice_moderation) { create(:im_first_review) }
      let!(:hit) { create(:hit, mt_hit_id: invoice_moderation.mt_hit_id) }
      let(:assignment) { Assignments::Creator.build_from(invoice_moderation.mt_hit_id, invoice_moderation.worker,hit) }

      it "creates an assignment" do
        expect(assignment.save).to be true
        expect(Assignment.count).to eq(1)
      end

      it "associates the hit" do
        assignment.save
        expect(assignment.hit).not_to be_nil
      end
    end
  end
end
