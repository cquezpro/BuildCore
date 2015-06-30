describe Mturk::Surveys::Creator do
  let(:invoice) { create(:invoice) }
  let(:hit) { create(:hit) }
  let(:surveys) { build_list(:survey, 3, invoice: invoice).collect(&:attributes) }
  let(:params) {
    {
      surveys:  surveys,
      invoice_id: invoice.id,
      mt_hit_id:  hit.mt_hit_id,
      mt_assignment_id: "mt_assignment_id",
      mt_worker_id: "mt_worker_id",
    }
  }
  let(:create_surveys) { Mturk::Surveys::Creator.create_surveys_with(params) }

  context "when sending valid parameters" do
    describe "#create_surveys_with" do
      before(:each) do
        surveys.each_with_index do |s, i|
          s[:invoice_pages] = []
          i.times do
            s[:invoice_pages] << { invoice_id: invoice.id, page_number: i + 1, line_items_count: i + 1 }
          end
        end
      end

      it { expect{create_surveys}.to change{ Worker.count }.by(1) }
      it { expect{create_surveys}.to change{ Assignment.count }.by(1) }
      it { expect{create_surveys}.to change{ Survey.count }.by(3) }
      it { expect{create_surveys}.to change{ invoice.surveys.count }.by(3) }
      it { expect{create_surveys}.to change{ invoice.invoice_pages.count }.by(3) }
    end
  end

  context "when sending invalid parameters" do
    describe "#create_surveys_with" do
      before(:each) do
        params[:surveys] = []
      end

      it { expect(create_surveys).to eq false }
      it { expect{create_surveys}.to change{ Worker.count }.by(0) }
      it { expect{create_surveys}.to change{ Assignment.count }.by(0) }
      it { expect{create_surveys}.to change{ Survey.count }.by(0) }
      it { expect{create_surveys}.to change{ invoice.surveys.count }.by(0) }

    end
  end
end
