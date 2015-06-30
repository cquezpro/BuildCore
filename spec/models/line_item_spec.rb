describe LineItem do
  it { is_expected.to belong_to(:vendor) }
  it { is_expected.to have_many(:invoice_transactions) }
end
