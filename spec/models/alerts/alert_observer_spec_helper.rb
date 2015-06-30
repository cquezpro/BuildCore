module AlertObserverSpecHelper

  module ContextHelper

    def does_not_occur_when_such_alert_alerady_exists
      it "does not occur when such alert already exists" do
        trigger
        ensure_alert_is_NOT_created
      end
    end

    def does_not_occur_when_vendor_is_missing
      it "does not occur when vendor is missing" do
        invoice.update! vendor: nil
        ensure_alert_is_NOT_created
      end
    end

    def does_not_occur_when_invoice_amount_due_is_missing
      it "does not occur when vendor is missing" do
        invoice.update! amount_due: nil
        ensure_alert_is_NOT_created
      end
    end

    def requires_10_other_invoices_for_that_vendor
      it "requires 10 other invoices for that vendor" do
        other_invoices.last.destroy!
        ensure_alert_is_NOT_created
      end
    end

    def requires_10_other_invoices_with_that_line_item
      it "requires 10 other invoices with that line item" do
        other_invoice_transactions.last.destroy!
        ensure_alert_is_NOT_created
      end
    end

    def creates_new_alert_even_if_there_are_just_few_invoices expected_alertable: nil
      it "creates new alert even if there are just few invoices" do
        other_invoices.each &:destroy!
        ensure_alert_is_created expected_alertable: expected_alertable
      end
    end

    def requires_that_user_has_been_created_at_least_month_ago
      it "requires that user has been created at least month ago" do
        user.update! created_at: (1.month.ago + 1.hour)
        ensure_alert_is_NOT_created
      end
    end

    def requires_amount_due_set
      it "requires that invoice#amount_due is set" do
        invoice.update! amount_due: nil
        ensure_alert_is_NOT_created
      end
    end

    def requires_presence_of_marked_through_hit
      it "requires that marked_through hit is present and submitted" do
        marked_through_hit.update! submited: false
        ensure_alert_is_NOT_created
      end
    end

    def creates_new_alert_otherwise expected_alertable: nil
      it "creates new alert otherwise" do
        ensure_alert_is_created expected_alertable: expected_alertable
      end
    end

  end


  module ExampleHelper

    def ensure_alert_is_created expected_alertable: nil
      expect { trigger }.to change { Alert.count }.by(1)
      created_alert = Alert.order("id DESC").first
      expect(created_alert.category).to eq(alert_category)
      expect(created_alert.invoice_owner).to eq(invoice)
      expect(created_alert.alertable).to eq(send expected_alertable)
    end

    def ensure_alert_is_NOT_created
      expect { trigger }.not_to change { Alert.count }
    end

  end

end
