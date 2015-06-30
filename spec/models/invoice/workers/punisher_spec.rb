describe Workers::Punisher do

  # describe "#punish_worker" do
  #   let(:worker) { Workers::Punisher.find(create(:worker).id) }

  #   it "decreases the worker score and block counter" do
  #     expect(worker.punish_worker!).to be true
  #     expect(worker.score).to eql(3)
  #     expect(worker.blocked?).to be false
  #     expect(worker.block_counter).to be(1)
  #   end

  #   context "by submissions" do
  #     let(:worker) { Workers::Punisher.find(create(:worker, score: 20).id) }

  #     it "blocks the worker after 5 negative submissions" do
  #       expect(worker.unblocked?).to be true
  #       5.times do
  #         worker.punish_worker!
  #       end
  #       expect(worker.blocked?).to be true
  #       expect(worker.score).to eq(10)
  #     end

  #     it "blocks workers after 2 blank submissions" do
  #       expect(worker.unblocked?).to eq(true)
  #       2.times { worker.punish_by_blank_submission! }
  #       expect(worker.blocked?).to eq(true)
  #     end
  #   end

  #   context "by score" do
  #     let(:worker_1) { Workers::Punisher.find(create(:worker, score: 1).id) }
  #     let(:worker_2) { Workers::Punisher.find(create(:worker, score: 2).id) }
  #     let(:worker_3) { Workers::Punisher.find(create(:worker, score: 3).id) }

  #     before(:each) do
  #       worker_1.invoice_moderations << create_list(:invoice_moderation, 5)
  #       worker_2.invoice_moderations << create_list(:invoice_moderation, 5)
  #       worker_3.invoice_moderations << create_list(:invoice_moderation, 5)
  #       worker_1.punish_worker!
  #       worker_2.punish_worker!
  #       worker_3.punish_worker!
  #     end

  #     it "blocks the worker if he reach less than or equal to 0 on score" do
  #       expect(worker_1.blocked?).to be(true)
  #       expect(worker_1.block_counter).to eq(1)
  #       expect(worker_2.blocked?).to be(true)
  #       expect(worker_2.block_counter).to eq(1)
  #     end

  #     it "blocks the worker if he reach less than or equal to 0 on score" do
  #       expect(worker_3.unblocked?).to be(true)
  #       expect(worker_3.block_counter).to eq(1)
  #     end
  #   end
  # end
end
