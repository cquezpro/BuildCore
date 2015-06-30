RSpec.describe Worker, :type => :model do

  describe "worker status" do
    let(:one) { create(:worker) }
    let(:two) { create(:worker) }
    let(:three) { create(:worker) }
    before(:each) do
      create_list(:assignment, 11, worker: one)
      create_list(:assignment, 11, worker: two)
      create_list(:assignment, 9, worker: three)

      create_list(:response, 11, worker: one, status: 1)
      create_list(:response, 11, worker: two, status: 0)
      create_list(:response, 10, worker: three, status: 0)
    end

    describe "bloking" do
      it { expect(one.responses.count).to eq(11) }
      it { expect(two.responses.count).to eq(11) }
      it { expect(three.responses.count).to eq(10) }

      it { expect(one.should_block_worker?).to eq(false) }
      it { expect(two.reload.should_block_worker?).to eq(true) }
      it { expect(three.should_block_worker?).to eq(false) }
    end
  end

  describe "qualifications" do
    let(:one) { create(:worker, grant_time: Time.now) }
    let(:two) { create(:worker, grant_time: nil) }

    it { expect(one.grant_qualification("example")).to eq(false) }
    it { expect(two.grant_qualification("example")).to eq(true) }
  end
end
