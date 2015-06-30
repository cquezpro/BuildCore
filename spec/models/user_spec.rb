describe User do
  it { is_expected.to have_many(:individuals) }
  it { is_expected.to have_many(:vendors) }
  it { is_expected.to have_many(:invoices) }
  it { is_expected.to have_many(:qb_classes) }
  it { is_expected.to have_many(:roles) }
end
