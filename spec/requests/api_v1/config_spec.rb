describe "config request" do

  describe "GET /config.json" do

    it "renders application config" do
      allow(Intercom).to receive(:app_id).and_return("12345")
      get "/api/v1/config.json"
      expect(response).to have_http_status(:ok)
      json = JSON.load response.body
      expect(json).to be_a(Hash)
      expect(json["intercom_app_id"]).to eq("12345")
    end
  end

end
