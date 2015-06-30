describe Mturk::ResponsesComparator, skip: "All failing specs disabled in order to make CI producing useful output" do
  let(:comparator) { Mturk::ResponsesComparator.new({comparation_attributes: comparation_fields, responses: responses})}

  before(:each) do
    [worker_one, worker_two, worker_three].map {|e| e.update_column :score, 0 }
    comparator.save
  end


  describe "surveys models" do
    let(:responses) do
      [
        create(:survey, is_invoice: true, vendor_present: true, address_present: true, amount_due_present: false, is_marked_through: true),
        create(:survey, is_invoice: true, vendor_present: true, address_present: false, amount_due_present: true, is_marked_through: true),
        create(:survey, is_invoice: true, vendor_present: true, address_present: true, amount_due_present: true, is_marked_through: true)
      ]
    end
    let(:worker_one) { responses.first.worker }
    let(:worker_two) { responses.second.worker }
    let(:worker_three) { responses.third.worker }
    let(:comparation_fields) { Survey::COMPARATION_FIELDS }

    describe "calculates the score correctly" do
      it { expect(worker_one.score).to eq(2) }
      it { expect(worker_one.responses.accepted.count).to eq(4) }
      it { expect(worker_one.responses.rejected.count).to eq(1) }
      it { expect(worker_one.responses.rejected.first.field_response).to eq("f") }
      it { expect(worker_one.responses.rejected.first.field_name).to eq("amount_due_present") }

      it { expect(worker_two.score).to eq(2) }
      it { expect(worker_two.responses.accepted.count).to eq(4) }
      it { expect(worker_two.responses.rejected.count).to eq(1) }
      it { expect(worker_two.responses.rejected.first.field_response).to eq("f") }
      it { expect(worker_two.responses.rejected.first.field_name).to eq("address_present") }

      it { expect(worker_three.score).to eq(5) }
      it { expect(worker_three.responses.accepted.count).to eq(5) }
      it { expect(worker_three.responses.rejected.count).to eq(0) }
    end

  end

  describe "invoice moderations models" do
    let(:responses) do
      [
        create(:im_first_review, name: "Match", amount_due: 123, due_date: Date.today, number: "123456789", address1: "Match", state: "NY", zip: 4000, city: "City", tax: 20),
        create(:im_first_review, name: "No Match", amount_due: 123, due_date: Date.tomorrow, number: "123", address1: "Match", state: "NY", zip: 4000, city: "City", tax: 20),
        create(:im_first_review, name: "Match", amount_due: nil, due_date: nil, number: nil, address1: nil, state: nil, zip: nil, city: nil, date: nil)
      ]
    end
    let(:worker_one) { responses.first.worker }
    let(:worker_two) { responses.second.worker }
    let(:worker_three) { responses.third.worker }
    let(:comparation_fields) { [:name, :address1, :state, :zip, :city, :tax, :number, :due_date, :date, :amount_due] }

    describe "calculates the score correctly" do

      it { expect(worker_one.score).to eq(8) }
      it { expect(worker_one.responses.accepted.count).to eq(8) }
      it { expect(worker_one.responses.rejected.count).to eq(0) }

      it { expect(worker_two.score).to eq(5) }
      it { expect(worker_two.responses.accepted.count).to eq(7) }
      it { expect(worker_two.responses.rejected.count).to eq(1) }

      it { expect(worker_three.score).to eq(2) } # Date gets automatically
      it { expect(worker_three.responses.accepted.count).to eq(2) }
      it { expect(worker_three.responses.rejected.count).to eq(0) }
    end

  end


  describe "turk transaction/invoice transactions models" do
    let(:responses) do
      [
        create(:im_first_review, name: "Match", amount_due: 123, due_date: Date.today, number: "123456789", address1: "Match", state: "NY", zip: 4000, city: "City", tax: 20),
        create(:im_first_review, name: "No Match", amount_due: 123, due_date: Date.tomorrow, number: "123", address1: "Match", state: "NY", zip: 4000, city: "City", tax: 20),
        create(:im_first_review, name: "Match", amount_due: nil, due_date: nil, number: nil, address1: nil, state: nil, zip: nil, city: nil, date: nil)
      ]
    end
    let(:worker_one) { responses.first.worker }
    let(:worker_two) { responses.second.worker }
    let(:worker_three) { responses.third.worker }
    let(:comparation_fields) { [:name, :address1, :state, :zip, :city, :tax, :number, :due_date, :date, :amount_due] }

    it "calculates the score correctly" do
      [worker_one, worker_two, worker_three].map {|e| e.update_column :score, 0 }
      comparator.save
      expect(worker_one.score).to eq(8)
      expect(worker_two.score).to eq(5)
      expect(worker_three.score).to eq(2) # Date gets automatically
    end

  end

end
