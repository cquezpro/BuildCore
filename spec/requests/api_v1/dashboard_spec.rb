describe "dashboard requests" do

  let!(:user) { create :user }
  let!(:individual) { create :individual, user: user, role: role, limit_max: within_limit }
  let!(:role) { create :role, permissions: ['read-today', 'read-Invoice'] }

  let!(:need_information) { create :invoice, :need_information, user: user, amount_due: nil }
  let!(:ready_for_payment) { create :invoice, :ready_for_payment, user: user, amount_due: within_limit }
  let!(:ready_for_payment_two) { create :invoice, :ready_for_payment, user: user, amount_due: within_limit }

  before { (create :invoice, :in_process, user: user, amount_due: within_limit).update_column(:status, 2) }
  before { (create :invoice, :in_process, user: user, amount_due: out_of_limit).update_column(:status, 2) }

  let!(:forbidden_invoice) { create :invoice, :ready_for_payment, user: user, amount_due: out_of_limit }

  let(:out_of_limit) { 500.0 }
  let(:within_limit) { 100.0 }

  as(:individual)

  describe "GET /dashboard.json" do
    before(:each) do
      need_information.update_column(:status, 3)
      ready_for_payment.update_column(:status, 4)
      forbidden_invoice.update_column(:status, 4)
    end

    it "returns invoices for today" do
      get "/api/v1/dashboard.json"
      expect(response).to have_http_status(:ok)
      json = JSON.load response.body

      expect(
        json["invoices"].map { |a| a["id"] }
      ).to include(ready_for_payment.id)

      expect(
        json["invoices"].map { |a| a["id"] }
      ).to include(ready_for_payment_two.id)

      expect(
        json["invoices"].map { |a| a["id"] }
      ).to include(need_information.id)

      expect(json["in_process_count"]).to eq(2) # all invoices, not only permitted
    end

    it "returns correct invoices" do

    end
  end

end
