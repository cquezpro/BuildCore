describe Workers::Payment do
  let(:hit) { create(:hit, reward: 0.01)}

  describe "#pay!" do
    let!(:assignments) { create_list(:assignment, 2, hit: hit) }
    let(:worker_1) { Workers::Payment.find(hit.workers.first.id) }
    let(:worker_2) { Workers::Payment.find(hit.workers.last.id) }

    it "pays the workers" do
      expect(worker_1.pay!(hit.reward)).to be true
      expect(worker_2.pay!(hit.reward, true)).to be true
    end

    describe "internals" do
      before(:each) do
        worker_1.pay!(hit.reward)
        worker_2.pay!(hit.reward, true)
      end

      it "adds the earning the hit earning to the worker" do
        expect(worker_1.earning.to_s).to eql("0.01")
        expect(worker_2.earning.to_s).to eq("0.01")
        expect((worker_1.earning - hit.reward).to_s).to eq("0.0")
      end

    end
  end
end
