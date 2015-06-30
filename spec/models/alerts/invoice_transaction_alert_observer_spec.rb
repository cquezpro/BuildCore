require_relative "./alert_observer_spec_helper"

describe Alerts::InvoiceTransactionAlertObserver do

  extend  AlertObserverSpecHelper::ContextHelper
  include AlertObserverSpecHelper::ExampleHelper

  let!(:user) { create :user, created_at: 2.year.ago }
  let!(:vendor) { create :vendor, user: user }
  let!(:line_item) { create :line_item, vendor: vendor }
  let!(:invoice) { create :invoice, :ready_for_payment, user: user, vendor: vendor, amount_due: 100.0 }
  let!(:invoice_transaction) { create :invoice_transaction, line_item: line_item, invoice: invoice }
  let(:observer) { described_class.new invoice_transaction }
  let(:trigger) { observer.watch_for observer_method_name }
  let(:observer_method_name) { alert_category }

  describe "#new_line_item" do
    let(:alert_category) { "new_line_item" }

    let!(:other_invoices) do
      10.times.map do |n|
        create :invoice, :ready_for_payment, user: user, vendor: vendor, amount_due: (n * 10.0 + 1.0)
      end
    end

    does_not_occur_when_such_alert_alerady_exists
    requires_10_other_invoices_for_that_vendor
    creates_new_alert_otherwise expected_alertable: :invoice_transaction

    context "when user is connected to QuickBooks" do
      let!(:user) { create :user, :connected_to_qb, created_at: 2.year.ago }
      creates_new_alert_even_if_there_are_just_few_invoices expected_alertable: :invoice_transaction
    end

    context "when destroying alertable" do
      it "destroys asociated alerts" do
        trigger
        alertable = Alert.last
        expect {alertable.destroy}.to change { Alert.count}.by (-1)
      end
    end
  end

  describe "#significant_change_in_line_items_quantity" do
    let(:alert_category) { "line_item_quantity" }

    let!(:other_invoice_transactions) do
      10.times.map do |n|
        invoice.update_columns(date: Date.yesterday)
        create :invoice_transaction, invoice: invoice, line_item: line_item, quantity: n
      end
    end

    does_not_occur_when_such_alert_alerady_exists
    requires_10_other_invoices_with_that_line_item
    creates_new_alert_otherwise expected_alertable: :invoice_transaction
  end

  describe "#significant_change_in_line_item_price_unit" do
    let(:alert_category) { "line_item_price_increase" }

    let!(:other_invoice_transactions) do
      10.times.map do |n|
        invoice.update_columns(date: Date.yesterday)
        create :invoice_transaction, invoice: invoice, line_item: line_item, price: (n * 10.0 + 1.0)
      end
    end

    does_not_occur_when_such_alert_alerady_exists
    requires_10_other_invoices_with_that_line_item
    creates_new_alert_otherwise expected_alertable: :invoice_transaction
  end

end
