require 'cancan/matchers'

RSpec.describe Ability do

  it "is a CanCanCan ability" do
    expect(Ability.instance_methods).to include(:can?)
  end

  it "sets up permissions basing on assigned role" do
    prepare_animal_permissions

    role = build_stubbed :role, permissions: [
      %w[manage Sheep],
      %w[pasture all],
    ]

    individual = build_stubbed :individual, role: role
    ability = Ability.new(individual)

    expect(ability).not_to be_able_to(:manage, :all)
    expect(ability).to     be_able_to(:pasture, Sheep)
    expect(ability).to     be_able_to(:pasture, Goat)
    expect(ability).to     be_able_to(:pasture, :anything_he_wants)
    expect(ability).to     be_able_to(:butcher, Sheep)
    expect(ability).not_to be_able_to(:butcher, Goat)
    expect(ability).not_to be_able_to(:butcher, :anything_he_wants)
  end

  it "is resilent to inexisting permissions" do
    prepare_animal_permissions

    role = Role.new permissions: [
      %w[manage Cow],
      %w[pasture Sheep],
    ]

    individual = build_stubbed :individual, role: role
    ability = Ability.new(individual)

    expect(ability).not_to be_able_to(:manage, Cow)
    expect(ability).not_to be_able_to(:pasture, Sheep)
  end

  context "regarding individual's invoice amount limits" do

    let(:low_invoice) { create :invoice, amount_due: 10.0 }
    let(:medium_invoice) { create :invoice, amount_due: 20.0 }
    let(:high_invoice) { create :invoice, amount_due: 30.0 }
    let(:blank_invoice) { create :invoice, amount_due: nil }

    let(:lower_bound) { 15.0 }
    let(:upper_bound) { 25.0 }

    let(:ability) { Ability.new individual }
    let(:available_by_sql) { Invoice.accessible_by ability, :manage }

    let(:expected_to_be_disallowed) { [low_invoice, medium_invoice, high_invoice, blank_invoice] - expected_to_be_allowed }

    context "when individual has no limits set" do
      let(:individual) { build_stubbed :individual, limit_min: nil, limit_max: nil }
      let(:expected_to_be_allowed) { [low_invoice, medium_invoice, high_invoice, blank_invoice] }
      it { honors_that }
    end

    context "when individual has both limits set" do
      let(:individual) { build_stubbed :individual, limit_min: lower_bound, limit_max: upper_bound }
      let(:expected_to_be_allowed) { [medium_invoice, blank_invoice] }
      it { honors_that }
    end

    context "when individual has only lower limit set" do
      let(:individual) { build_stubbed :individual, limit_min: lower_bound, limit_max: nil }
      let(:expected_to_be_allowed) { [medium_invoice, high_invoice, blank_invoice] }
      it { honors_that }
    end

    context "when individual has only upper limit set" do
      let(:individual) { build_stubbed :individual, limit_min: nil, limit_max: upper_bound }
      let(:expected_to_be_allowed) { [low_invoice, medium_invoice, blank_invoice] }
      it { honors_that }
    end

    def honors_that
      expected_to_be_allowed.each do |invoice|
        expect(ability).to be_able_to(:manage, invoice), "Invoice's amount due was #{invoice.amount_due}"
        expect(available_by_sql).to include(invoice), "Invoice's amount due was #{invoice.amount_due}"
      end

      expected_to_be_disallowed = [low_invoice, medium_invoice, high_invoice] - expected_to_be_allowed
      expected_to_be_disallowed.each do |invoice|
        expect(ability).not_to be_able_to(:manage, invoice), "Invoice's amount due was #{invoice.amount_due}"
        expect(available_by_sql).not_to include(invoice), "Invoice's amount due was #{invoice.amount_due}"
      end
    end

  end

  it "restricts individual's access to invoices by expense accounts" do
    equipment_account = create :expense_account
    materials_account = create :expense_account
    equipment_invoice = create :invoice, expense_account: equipment_account
    materials_invoice = create :invoice, expense_account: materials_account

    role = Role.stock.where(name: "Administrator").first
    individual = create :individual, permitted_expense_accounts: [equipment_account], role: role
    ability = Ability.new(individual)

    # Because authorization can be applied both on instantiated objects
    # and SQL queries, we need two check them in two ways:

    expect(ability).to be_able_to(:update, equipment_invoice)
    expect(ability).not_to be_able_to(:update, materials_invoice)

    available_by_sql = Invoice.accessible_by(ability, :update)
    expect(available_by_sql).to include(equipment_invoice)
    expect(available_by_sql).not_to include(materials_invoice)
  end

  it "restricts individual's access to invoices by QuickBooks classes" do
    location_denver = create :qb_class
    location_dallas = create :qb_class
    denver_invoice = create :invoice, qb_class: location_denver
    dallas_invoice = create :invoice, qb_class: location_dallas

    role = Role.stock.where(name: "Administrator").first
    individual = create :individual, permitted_qb_classes: [location_denver], role: role
    ability = Ability.new(individual)

    # Because authorization can be applied both on instantiated objects
    # and SQL queries, we need two check them in two ways:

    expect(ability).to be_able_to(:update, denver_invoice)
    expect(ability).not_to be_able_to(:update, dallas_invoice)

    available_by_sql = Invoice.accessible_by(ability, :update)
    expect(available_by_sql).to include(denver_invoice)
    expect(available_by_sql).not_to include(dallas_invoice)
  end

  it "restricts individual's access to invoices by vendors" do
    one = create :vendor
    two = create :vendor
    invoice_one = create :invoice, vendor: one
    invoice_two = create :invoice, vendor: two

    role = Role.stock.where(name: "Administrator").first
    individual = create :individual, permitted_vendors: [one], role: role
    ability = Ability.new(individual)

    # Because authorization can be applied both on instantiated objects
    # and SQL queries, we need two check them in two ways:

    expect(ability).to be_able_to(:update, invoice_one)
    expect(ability).not_to be_able_to(:update, invoice_two)

    available_by_sql = Invoice.accessible_by(ability, :update)
    expect(available_by_sql).to include(invoice_one)
    expect(available_by_sql).not_to include(invoice_two)
  end

  it "restricts individual's access to vendors" do
    one = create :vendor
    two = create :vendor

    role = Role.stock.where(name: "Administrator").first
    individual = create :individual, permitted_vendors: [one], role: role
    ability = Ability.new(individual)

    # Because authorization can be applied both on instantiated objects
    # and SQL queries, we need two check them in two ways:

    expect(ability).to be_able_to(:update, one)
    expect(ability).not_to be_able_to(:update, two)

    available_by_sql = Vendor.accessible_by(ability, :update)
    expect(available_by_sql).to include(one)
    expect(available_by_sql).not_to include(two)
  end

  it "honors read_incomplete-Invoice permission granting access to Invoices with missing information" do
    # If this fails, most likely invoices are not created correctly
    # (their statuses change on save due to ASM constraints)
    role = create :role, permissions: ['read_incomplete-Invoice']
    individual = create :individual, role: role
    ability = Ability.new(individual)

    allowed_statuses = %w[need_information issue_check issue_wire]
    invoices = Invoice.statuses.keys.map { |s| create :invoice, status: s }
    invoices.each &:reload # some statuses may be altered on save (missing fields etc.)
    allowed, disallowed = invoices.partition { |i| i.status.to_s.in? allowed_statuses }
    available_by_sql = Invoice.accessible_by(ability, :read)

    expect(allowed).not_to be_empty
    expect(disallowed).not_to be_empty

    allowed.each do |i|
      expect(ability).to be_able_to(:read, i)
      expect(available_by_sql).to include(i)
    end

    disallowed.each do |i|
      expect(ability).not_to be_able_to(:read, i)
      expect(available_by_sql).not_to include(i)
    end
  end

  it "accepts nil as individual" do
    prepare_animal_permissions

    ability = Ability.new(nil)
    expect(ability.individual).to be(nil)
    expect(ability.role).to be(nil)
    expect(ability.permissions).to be_empty
    expect(ability).not_to be_able_to(:pasture, Sheep)
  end

  def prepare_animal_permissions
    stub_const "Sheep", Class.new
    stub_const "Goat", Class.new
    stub_const "Cow", Class.new
    stub_const "Permission", {
      %w[manage Sheep] => (double :action => :manage, :subject => Sheep),
      %w[pasture all] =>  (double :action => :pasture, :subject => :all),
    }
  end
end
