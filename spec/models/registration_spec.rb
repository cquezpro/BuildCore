describe Registration do
  subject { described_class.new(attributes_for_new) }

  let(:test_phone_number){ "+15005550004" }
  let(:attributes_for_new) { valid_attributes_for_new }
  let(:valid_attributes_for_new) do
    {
      "email" => "bill@sync.com",
      "password" => "very1secret",
      "password_confirmation" => "very1secret",
      "name"=>"Mr Bill Sync",
      "business_name" => "Bill-o-Sync",
      "mobile_phone"=>test_phone_number,
      "timezone"=>"Europe/Berlin",
      "terms_of_service"=>true
    }
  end
  let(:blank_attributes_for_new) do
    all_attribute_names.map{ |k| [k, ""] }.to_h.merge "terms_of_service" => false
  end
  let(:all_attribute_names) { valid_attributes_for_new.keys }

  let(:built_individual) { subject }
  let(:built_user) { subject.user }
  let(:built_number) { subject.number }

  it "assigns individual attributes to itself" do
    expect(built_individual.email).to eq("bill@sync.com")
    expect(built_individual.name).to eq("Mr Bill Sync")
    expect(built_individual.password).to be_present
  end

  it "assigns attributes to user" do
    expect(built_user.business_name).to eq("Bill-o-Sync")
    expect(built_user.timezone).to eq("Europe/Berlin")
    expect(built_user.terms_of_service).to be(true)
  end

  it "assigns attributes to number" do
    expect(built_number.string).to eq(test_phone_number)
  end

  context "when valid attributes are passed" do
    it "builds valid individual" do
      expect(built_individual).to be_valid
    end

    it "builds valid user" do
      expect(built_user).to be_valid
    end

    it "builds valid number" do
      expect(built_number).to be_valid
    end
  end

  context "when invalid attributes are passed" do
    let(:attributes_for_new) { blank_attributes_for_new }

    it "detects errors on registration attributes" do
      expect(subject).not_to be_valid

      (all_attribute_names - %w[password_confirmation]).each do |attribute|
        expect(subject.errors[attribute]).to be_present, "Expected validation error on #{attribute}"
      end
    end
  end

  context "when chosen mobile number or e-mail already exist" do
    # VCR cassette needed for Registration.create!
    it "detects errors on duplicated registration attributes_for_new", :vcr do
      Registration.create! attributes_for_new
      expect(subject).not_to be_valid

      %w[email mobile_phone].each do |attribute|
        expect(subject.errors[attribute]).to include("has already been taken"), "Expected uniqueness violation error on #{attribute}"
      end
    end
  end

  context "when misformatted attributes are passed" do
    let(:attributes_for_new) { valid_attributes_for_new.merge "email" => "not@email", "mobile_phone" => "123" }

    it "detects errors on those attributes" do
      expect(subject).not_to be_valid

      %w[email mobile_phone].each do |attribute|
        expect(subject.errors[attribute]).to be_present, "Expected format violation error on #{attribute}"
      end
    end
  end
end
