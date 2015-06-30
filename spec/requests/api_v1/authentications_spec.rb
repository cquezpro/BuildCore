describe "user requests" do

  let(:http_method){ |ex| ex.example_group.description.split(/\s+/)[0] }
  let(:path){ |ex| ex.example_group.description.split(/\s+/)[1] }
  let(:performer){ proc{ |*args| send http_method.downcase, path, *args } }

  let(:test_phone_number){ "+15005550004" }

  describe "POST /auth/sign_up.json", :vcr do
    let(:valid_sign_up_params) do
      {
        "individual" => {
          "email"=>"bill@example.test", "password"=>"asdf4321",
          "password_confirmation"=>"asdf4321", "name"=>"Mr Bill Sync",
          "mobile_phone"=>test_phone_number, "business_name"=>"Bill-o-Sync",
          "timezone"=>"Europe/Berlin", "terms_of_service"=>"1"
        }
      }
    end

    it "creates a new user" do
      expect {
      expect {
      expect {
        performer.call valid_sign_up_params
        expect(response).to have_http_status(:created)
      }.to change{ User.count }.by(1)
      }.to change{ Individual.count }.by(1)
      }.to change{ Number.count }.by(1)
    end
  end

end
