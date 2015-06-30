require_relative "./alert_observer_spec_helper"

describe Alerts::InvoiceAlertObserver do

  extend  AlertObserverSpecHelper::ContextHelper
  include AlertObserverSpecHelper::ExampleHelper

  let!(:user) { create :user, created_at: 2.year.ago }
  let!(:vendor) { create :vendor, user: user }
  let!(:invoice) { create :invoice, :ready_for_payment, user: user, vendor: vendor, amount_due: 100.0 }
  let(:observer) { described_class.new invoice }
  let(:trigger) { observer.watch_for observer_method_name }
  let(:observer_method_name) { alert_category }

  describe "#significant_increase_in_total" do
    let(:alert_category) { "invoice_increase_total" }

    let!(:other_invoices) do
      10.times.map do |n|
        create :invoice, :ready_for_payment, user: user, vendor: vendor, amount_due: (n * 10.0 + 1.0)
      end
    end

    does_not_occur_when_such_alert_alerady_exists
    does_not_occur_when_vendor_is_missing
    does_not_occur_when_invoice_amount_due_is_missing
    requires_10_other_invoices_for_that_vendor
    creates_new_alert_otherwise expected_alertable: :invoice
  end

  describe "#new_vendor" do
    let(:alert_category) { "new_vendor" }

    does_not_occur_when_such_alert_alerady_exists
    does_not_occur_when_vendor_is_missing
    requires_that_user_has_been_created_at_least_month_ago
    creates_new_alert_otherwise expected_alertable: :vendor
  end

  describe "#existing_invoice" do
    let(:alert_category) { "duplicate_invoice" }

    let!(:dupe_invoice) { invoice.dup.tap &:save! }

    does_not_occur_when_such_alert_alerady_exists
    creates_new_alert_otherwise expected_alertable: :dupe_invoice
  end

  describe "#manual_adjustment" do
    let(:alert_category) { "manual_adjustment" }

    let!(:marked_through_hit) { create :hit, :marked_through, :submited, invoice: invoice }

    does_not_occur_when_such_alert_alerady_exists
    requires_amount_due_set
    requires_presence_of_marked_through_hit
    creates_new_alert_otherwise expected_alertable: :invoice
  end

end
