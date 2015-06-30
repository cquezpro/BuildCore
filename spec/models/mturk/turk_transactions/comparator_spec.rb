describe Mturk::TurkTransactions::Comparator do
  let(:workers) { create_list(:worker, 2) }
  let(:hit) { create(:hit, hit_type: :for_line_item, workers: workers) }
  let(:invoice) { create(:invoice, hits: [hit]) }
  let(:comparator) { Mturk::TurkTransactions::Comparator.build_with(invoice, hit) }

  describe "shared example" do
    before(:each) do
      workers.each do |worker|
        3.times do |i|
          create(:turk_transaction, worker: worker, invoice: invoice, description: "description #{i}", total: "10#{i}")
        end
      end
    end

    describe "without database items" do
      it { expect{comparator.save}.to change{ LineItem.count }.by(3) }
      it { expect{comparator.save}.to change{ invoice.invoice_transactions.count }.by(2) }
    end

    describe "with database items" do
      before(:each) do
        workers.first.turk_transactions.each do |ts|
          create(:line_item, vendor_id: invoice.vendor.id, description: ts.description)
        end
      end

      it { expect{comparator.save}.to change{ LineItem.count }.by(0) }
      it { expect{comparator.save}.to change{ invoice.invoice_transactions.count }.by(2) }

      it "creates transactions with the correct associated item" do
        comparator.save
        expect(invoice.reload.invoice_transactions.pluck(:line_item_id).uniq.count).to eq(3)
      end
    end

    describe "with 3 workers" do
      describe "Normal description" do
        let(:worker) { create(:worker) }
        before(:each) do
          workers.first.turk_transactions.each_with_index do |ts, index|
            ts.update_column(:description, index + 10)
          end
          hit.workers << worker
          3.times do |i|
            create(:turk_transaction, worker: worker, invoice: invoice, description: "description #{i}", total: "10#{i}")
          end
        end

        it { expect(LineItem.count).to eq(1) }
        it { expect(invoice.invoice_transactions.count).to eq(1) }
        it { expect{comparator.save}.to change{ LineItem.count }.by(3) }
        it { expect{comparator.save}.to change{ invoice.invoice_transactions.count }.by(3) }
        it "recalculate worker score" do
          hit.workers.update_all(score: 0)
          comparator.save
          expect(worker.reload.score).to eq(18)
        end
      end
    end
  end

  describe "Normal description" do
    let(:worker) { create(:worker) }
    before(:each) do
      hit.workers << worker
      [workers, worker].flatten.each do |w|
        ["Duff Beer", "Duff Dark"].each do |string|
          create(:turk_transaction, worker: w, invoice: invoice, description: string, total: 10)
        end
      end
    end

    it { expect{comparator.save}.to change{ LineItem.count }.by(2) }
    it { expect{comparator.save}.to change{ invoice.invoice_transactions.count }.by(2) }

    it "creates line items and transactions" do
      comparator.save
      expect(LineItem.count).to eq(3)
      expect(invoice.invoice_transactions.count).to eq(3)
    end

    it "recalculate worker score" do
      hit.workers.update_all(score: 0)
      comparator.save
      expect(worker.reload.score).to eq(24)
      expect(worker.responses.accepted.count).not_to eq(0)
      expect(worker.responses.rejected).not_to eq(0)
      expect(worker.error_response_rate).to be < 5
    end
  end

end
