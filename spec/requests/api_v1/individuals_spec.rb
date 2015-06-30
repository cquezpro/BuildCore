describe "individuals requests" do

  let(:user){ create :user }
  let(:admin_individual){ create :individual, user: user }

  as(:admin_individual)

  describe "GET /individuals.json" do
    let!(:another_individual){ create :individual, user: user }

    it "lists user's individuals" do
      path = "/api/v1/individuals.json"
      params = {user_id: user.id}
      get path, params
      expect(response).to have_http_status(:ok)
      json = JSON.load response.body
      expect(json).to be_an(Array)
      expect(json.size).to eq(2)
      emails_in_json = json.map{ |h| h["email"] }.to_set
      expected_emails = [admin_individual, another_individual].map(&:email).to_set
      expect(emails_in_json).to eq(expected_emails)
      expect(json.first["role_id"]).to be_present
    end
  end

  describe "POST /individuals.json" do
    it "creates a new individual" do
      allow(Intercom::User).to receive(:create)
      allow(Intercom::Company).to receive(:create)

      # Expect messages: 1) welcome 2) his password
      expect(Intercom::Message).to receive(:create).twice

      expect {
        path = "/api/v1/individuals.json"
        ind_params = attributes_for :individual, email: "new.guy@example.test"
        params = {user_id: user.id, individual: ind_params}
        Sidekiq::Testing.inline! do
          post path, params
        end
        expect(response).to have_http_status(:created)
      }.to change{ Individual.count }

      created_individual = Individual.unscoped.last
      expect(created_individual.email).to eq("new.guy@example.test")
      expect(created_individual.user).to eq(user)
    end
  end

  describe "PATCH /individuals/:id.json" do
    it "updates individual" do
      expect {
        path = "/api/v1/individuals/#{admin_individual.id}.json"
        ind_params = attributes_for :individual, email: "new.guy@example.test"
        params = {user_id: user.id, individual: ind_params}
        patch path, params
        expect(response).to have_http_status(:ok)
      }.to change{ admin_individual.reload.email }.to("new.guy@example.test")
    end

    it "updates authorization scopes" do
      vendors = 2.times.map { create :vendor, user: user }
      qb_classes = 2.times.map { create :qb_class, user: user }
      expenses = 2.times.map { create :expense_account, user: user }

      old_scopes, new_scopes = [vendors, qb_classes, expenses].transpose

      admin_individual.permitted_vendors << old_scopes[0]
      admin_individual.permitted_qb_classes << old_scopes[1]
      admin_individual.permitted_expense_accounts << old_scopes[2]

      new_scopes_in_api_format = new_scopes.map do |s|
        Api::V1::AuthorizationScopeSerializer.new(s, root: false).serializable_hash
      end

      path = "/api/v1/individuals/#{admin_individual.id}.json"
      ind_params = attributes_for :individual, authorization_scopes: new_scopes_in_api_format
      params = {user_id: user.id, individual: ind_params}
      patch path, params
      expect(response).to have_http_status(:ok)

      admin_individual.reload
      expect(admin_individual.permission_scopes.to_set).to eq(new_scopes.to_set)
    end
  end

  describe "GET /individuals/authorization_scopes.json" do
    it "renders an array" do
      create :expense_account, user: user, name: "Some Expense Account"
      create :vendor, user: user, name: "Some Ugly Vendor"
      create :qb_class, user: user, name: "Most Important Location"
      path = "/api/v1/individuals/authorization_scopes.json"
      params = {user_id: user.id}
      get path, params
      expect(response).to have_http_status(:ok)
      json = JSON.load response.body
      expect(json).to be_an(Array)
      expect(json.size).to eq(3)
      scope_names = json.map { |h| h["name"] }
      expect(scope_names).to include("Some Expense Account")
      expect(scope_names).to include("Some Ugly Vendor")
      expect(scope_names).to include("Most Important Location")
    end
  end

end
