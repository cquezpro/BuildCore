describe Alerts::AlertCreator do

  Alert.categories.keys.each do |category_name|
    context "for #{category_name} alert category" do
      let(:category) { category_name }
      let(:alert) { build :alert_creator, category_name.to_sym }

      it "sets meaningful texts" do
        if category_name == "resending_payment"
          skip "This alert is not created via #{described_class.name} yet."
        end

        expect{ alert.save! }.to change {
          alert.short_text
        }.and change {
          alert.large_text
        }.and change {
          alert.sms_text
        }
      end
    end
  end

end
