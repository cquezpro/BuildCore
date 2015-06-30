require "rails_helper"

class TestMail < Struct.new(:individual)

  def from
    { email: individual.email }
  end

  def body
    "somebody"
  end

  def attachments
    [File.open(Rails.root.join "spec", "file_fixtures", "Composition7_horizontal.jpg")]
  end
end

describe EmailProcessor do

  describe "creating invoices" do
    let(:user) { create(:user) }
    let(:individual) {create :individual, user: user }
    let(:mail) { TestMail.new(individual) }

    describe "#process" do
      before(:each) { user.individuals << individual}
      let(:processor) { EmailProcessor.new(mail) }

      context "with correct parameters" do
        it { expect{processor.process}.to change{Invoice.count}.by(1) }
        it "creates the invoice with the individual associated user" do
          expect(user.invoices.count).to eq(0)
          processor.process
          expect(user.invoices.count).to eq(1)
          expect(user.invoices.last.source_email).to eq(individual.email)
        end
      end
    end
  end

end
