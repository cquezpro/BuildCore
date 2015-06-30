describe "invoices requests" do

  let(:user) { create :user }
  let(:invoice) { create :invoice, user: user }
  let(:hit) { create :hit, invoice: invoice }

  let(:invoice_reader_role) { create :role, permissions: %w[read-Invoice] }
  let(:invoice_manager_role) { create :role, permissions: %w[manage-Invoice] }

  let(:invoice_reader) { create :individual, user: user, role: invoice_reader_role }
  let(:invoice_manager) { create :individual, user: user, role: invoice_manager_role }

  let(:parsed_response) { JSON.parse response.body, symbolize_names: true }

  describe "GET /invoices/:id.json with hit_id" do
    it "renders invoice for Turk without need for authentication" do
      path = "/api/v1/invoices/hit.json"
      params = {hit_id: hit.mt_hit_id}
      get path, params
      expect(response).to have_http_status(:ok)
    end
  end

  describe "PUT /invoices/aasm_events" do
    as(:invoice_manager)

    it "performs given action on passed invoices" do
      path = "/api/v1/invoices/aasm_events.json"
      params = {ids: [invoice.id], status: "mark_as_deleted!"}
      expect {
        put path, params
      }.to change { invoice.reload.status }.to("deleted")
      expect(response).to have_http_status(:ok)
      expect(parsed_response).to be_an(Array)
      expect(parsed_response.length).to eq(1)
      expect(parsed_response[0][:status]).to eq("deleted")
    end

    it "prevents from calling disallowed events" do
      expect_any_instance_of(Invoice).not_to receive(:stupid!).and_return(true)
      path = "/api/v1/invoices/aasm_events.json"
      params = {ids: [invoice.id], status: "stupid!"}
      expect {
        put path, params
      }.not_to change { invoice.reload.status }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "GET /invoices/:id/invoice_transactions.json" do
    let!(:transactions) { create_list :invoice_transaction, 2, invoice: invoice }

    as(:invoice_reader)

    it "lists invoice transactions for given invoice roles" do
      path = "/api/v1/invoices/#{invoice.id}/invoice_transactions.json"
      get path
      expect(response).to have_http_status(:ok)
      json = JSON.load response.body
      expect(json).to be_an(Array)
      expect(json.size).to be >= 2 # may contain some default transactions
    end
  end

end
