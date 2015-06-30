describe Workers::Comparator do

 context "compare by score"  do
  let(:worker_1) { create(:worker, score: 5) }
  let(:worker_2) { create(:worker, score: 6) }
  let(:worker_3) { create(:worker, score: 7) }
  let(:worker_4) { create(:worker, score: 0) }
  let(:comparator_1) { Workers::Comparator.new(worker_1, worker_2) }
  let(:comparator_2) { Workers::Comparator.new(worker_3, worker_2) }
  let(:comparator_3) { Workers::Comparator.new(worker_4, worker_4) }

  it "returns the worker with hight score" do
    expect(comparator_1.comparate_by_score).to eq(worker_2)
    expect(comparator_2.comparate_by_score).to eq(worker_3)
    expect(comparator_3.comparate_by_score).to eq(worker_4)
  end

  it "cant be false" do
    expect(comparator_1.comparate_by_score).not_to be false
    expect(comparator_1.comparate_by_score).not_to be false
    expect(comparator_1.comparate_by_score).not_to be false
  end
 end
end
