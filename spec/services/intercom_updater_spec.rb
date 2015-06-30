describe IntercomUpdater, :vcr do

  let!(:intercom_company) do
    class_double("Intercom::Company").as_stubbed_const
  end

  let!(:intercom_user) do
    class_double("Intercom::User").as_stubbed_const
  end

  let!(:user) { create :user }
  let!(:individual) { create :individual, user: user, sign_in_count: 3, last_sign_in_at: 2.days.ago }
  let!(:vendor) { create :vendor, user: user }
  let!(:invoice) { create :invoice, user: user, vendor: vendor, act_by: 1.year.from_now }
  let!(:registration) { create :registration }

  describe "::update" do
    context "for User" do
      it "sends Intercom company object" do
        expect(intercom_company).to receive(:create).with(Hash) do |hash|
          expect(hash[:company_id]).to eq(user.id)
          expect(hash[:remote_created_at]).to be_a(Fixnum)
          expect(hash[:name]).to eq(user.business_name)

          expect(hash[:custom_attributes]).to be_a(Hash)
          expect(hash[:custom_attributes].keys).to all(be_a(String))
          expect(hash[:custom_attributes].values).to all(be_intercom_allowed_value)
        end
        IntercomUpdater.update(user)
      end
    end

    context "for Individual" do
      it "sends Intercom user object" do
        expect(intercom_user).to receive(:create).with(Hash) do |hash|
          expect(hash[:user_id]).to eq(individual.id)
          expect(hash[:signed_up_at]).to be_a(Fixnum)
          expect(hash[:name]).to eq(individual.name)
          expect(hash[:email]).to eq(individual.email)

          expect(hash[:companies]).to eq([{company_id: user.id}])

          expect(hash[:custom_attributes]).to be_a(Hash)
          expect(hash[:custom_attributes].keys).to all(be_a(String))
          expect(hash[:custom_attributes].values).to all(be_intercom_allowed_value)
        end
        IntercomUpdater.update(individual)
      end
    end
  end

  describe "::delayed_update" do
    it "eventually calls ::update with the same object" do
      Sidekiq::Testing.inline! do
        [user, individual, registration].each do |object|
          expect(IntercomUpdater).to receive(:update).with(object)
          IntercomUpdater.delayed_update object
        end
      end
    end
  end

  def be_intercom_allowed_value
    be_a(String).or be_a(Numeric).or be(true).or be(false)

    # Nil value is actually correct for Intercom.  However we prefer non-nils
    # here as they're more useful in context of these specs.  Nils are always
    # serialized properly for Intercom, records are never.
    #
    #.or be(nil)
  end

end
