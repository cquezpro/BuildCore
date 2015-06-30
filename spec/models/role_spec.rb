RSpec.describe Role do

  it { is_expected.to belong_to(:user) }
  it { is_expected.to allow_value(nil).for(:user) }

  example "::default is defined and present" do
    expect(Role::default).to be_present
    expect(Role::default).to be_stock
    expect(Role::default.name).to eq("Administrator")
  end

  describe "#stock?" do
    example{ expect(Role.new user: nil).to be_stock }
    example{ expect(Role.new user: User.new).not_to be_stock }
  end

end
