require "cancan/matchers"

describe "roles requests" do

  let(:user){ create :user }
  let(:individual){ create :individual, user: user }

  as(:individual)

  describe "GET /roles.json" do
    let!(:custom_role){ create :role, user: user, name: "Custom", permissions: ["record-Payment"] }

    it "lists user defined and stock roles" do
      path = "/api/v1/roles.json"
      params = {user_id: user.id}
      get path, params
      expect(response).to have_http_status(:ok)
      json = JSON.load response.body
      expect(json).to be_an(Array)
      expect(json.size).to be > 1

      admin_role_json = json.find{ |r| r["name"] == "Administrator" }
      expect(admin_role_json["stock"]).to be(true)
      expect(admin_role_json["permissions"]).to be_present

      custom_role_json = json.find{ |r| r["name"] == "Custom" }
      expect(custom_role_json["stock"]).to be(false)
      expect(custom_role_json["permissions"]).to eq(["record-Payment"])
    end
  end

  describe "POST /roles.json" do
    it "creates a new role" do
      expect {
        path = "/api/v1/roles.json"
        role_params = {name: "New Role", permissions: %w[read-Vendor read-User]}
        params = {user_id: user.id, role: role_params}
        post path, params
        expect(response).to have_http_status(:created)
      }.to change{ Role.count }.by(1)

      created_role = Role.unscoped.last
      expect(created_role.name).to eq("New Role")
      expect(created_role.user).to eq(user)
      expect(created_role.permissions).to eq(%w[read-Vendor read-User])
    end
  end

  describe "PATCH /roles/:id.json" do
    let!(:custom_role){ create :role, user: user, permissions: %w[read-Vendor read-User] }

    it "updates role" do
      path = "/api/v1/roles/#{custom_role.id}.json"
      role_params = attributes_for :role, permissions: %w[read-Vendor text-Invoice]
      params = {user_id: user.id, role: role_params}
      patch path, params
      expect(response).to have_http_status(:ok)

      custom_role.reload
      expect(custom_role.permissions).to eq(%w[read-Vendor text-Invoice])
    end
  end

  describe "DELETE /roles.json" do
    let!(:custom_role){ create :role, user: user }

    it "deletes user defined role" do
      expect {
        path = "/api/v1/roles/#{custom_role.id}.json"
        params = {user_id: user.id}
        delete path, params
        expect(response).to have_http_status(:ok)
      }.to change{ Role.count }
    end
  end

end
