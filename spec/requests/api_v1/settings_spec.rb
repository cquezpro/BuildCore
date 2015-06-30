describe "settings requests" do

  let(:user){ create :user }
  let(:admin_individual){ create :individual, user: user, password: "s3cr3t" }

  as(:admin_individual)

  describe "GET /settings.json" do
    it "renders current user" do
      path = "/api/v1/settings.json"
      get path
      expect(response).to have_http_status(:ok)
      expect_response_to_be_looking_like_current_individual
    end
  end

  describe "PATCH /settings.json" do
    it "updates individual's email" do
      expect {
        path = "/api/v1/settings.json"
        user_params = attributes_for :user
        ind_params = attributes_for :individual, user: user_params, email: "new.mail@example.test"
        params = {user_id: user.id, individual: ind_params}
        patch path, params
        expect(response).to have_http_status(:ok)
      }.to change{ admin_individual.reload.email }.to("new.mail@example.test")
    end

    it "updates submitted user settings" do
      expect {
        path = "/api/v1/settings.json"
        user_params = attributes_for :user, billing_state: "CA"
        ind_params = attributes_for :individual, user: user_params
        params = {user_id: user.id, individual: ind_params}
        patch path, params
        expect(response).to have_http_status(:ok)
      }.to change{ user.reload.billing_state }.to("CA")
    end

    it "updates alert settings" do
      expect {
        path = "/api/v1/settings.json"
        user_params = attributes_for :user
        ind_params = attributes_for :individual, user: user_params, email_new_invoice_onchange: true
        params = {user_id: user.id, individual: ind_params}
        patch path, params
        expect(response).to have_http_status(:ok)
      }.to change{ admin_individual.common_alert_settings.email_new_invoice_onchange }.to(true)
    end

    it "renders updated invdividual" do
      path = "/api/v1/settings.json"
      user_params = attributes_for :user
      ind_params = attributes_for :individual, user: user_params
      params = {user_id: user.id, individual: ind_params}
      patch path, params
      expect(response).to have_http_status(:ok)
      expect_response_to_be_looking_like_current_individual
    end
  end

  describe "POST /settings/password.json" do
    it "updates individual's password and renders updated individual" do
      path = "/api/v1/settings/password.json"
      params = {current_password: "s3cr3t", password: "n3w-s3cr3t", password_confirmation: "n3w-s3cr3t"}
      post path, params
      expect(response).to have_http_status(:ok)
      expect(admin_individual).to be_valid_password("n3w-s3cr3t")
      expect_response_to_be_looking_like_current_individual
    end
  end

  def expect_response_to_be_looking_like_current_individual
    json = JSON.load response.body
    expect(json).to be_a(Hash)
    expect(json["user"]).to be_a(Hash)
  end

end
