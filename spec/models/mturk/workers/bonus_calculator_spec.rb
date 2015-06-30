describe Mturk::Workers::BonusCalculator do
  let(:calculator) { Mturk::Workers::BonusCalculator.new(matchs: num_matchs) }

  describe "#save" do
      let(:worker) { create(:worker) }

      describe "with 10 matchs" do
        let(:num_matchs) { 10 }
        context "it calculates de bonus correctly" do
          before(:each) { calculator.save }

          it { expect(calculator.bonus).not_to eq(nil) }
          it { expect(calculator.bonus).to eq(BigDecimal.new("0.00")) }
        end
      end

      describe "with 5 matchs" do
        let(:num_matchs) { 5 }
        context "it calculates de bonus correctly" do
          before(:each) { calculator.save }

          it { expect(calculator.bonus).not_to eq(nil) }
          it { expect(calculator.bonus).to eq(BigDecimal.new("0.00")) }
        end
      end

      describe "with 25 matchs" do
        let(:num_matchs) { 25 }
        context "it calculates de bonus correctly" do
          before(:each) { calculator.save }

          it { expect(calculator.bonus).not_to eq(nil) }
          it { expect(calculator.bonus).to eq(BigDecimal.new("0.10")) }
        end
      end

      describe "with 15 matchs" do
        let(:num_matchs) { 15 }
        context "it calculates de bonus correctly" do
          before(:each) { calculator.save }

          it { expect(calculator.bonus).not_to eq(nil) }
          it { expect(calculator.bonus).to eq(BigDecimal.new("0.05")) }
        end
      end

      describe "with 0 matchs" do
        let(:num_matchs) { 0 }
        context "it calculates de bonus correctly" do
          before(:each) { calculator.save }

          it { expect(calculator.bonus).not_to eq(nil) }
          it { expect(calculator.bonus).to eq(BigDecimal.new("0.0")) }
        end
      end


  end

end
