class QuickbooksSync::Invoices::BillPayment < Invoice
    Quickbooks.logger = Rails.logger
    Quickbooks.log = true


  def sync!
    return unless user.bank_account
    service.create(qb_model)
  end

  private

  def service
    return @service if @service

    @service ||= Quickbooks::Service::BillPayment.new
    @service.access_token = user.user_oauth_intuit
    @service.realm_id = user.realm_id

    @service
  end

  def qb_model
    Quickbooks::Model::BillPayment.new(qb_params)
  end

  def qb_params
    {
      # id: qb_id,
      # sync_token: sync_token,
      vendor_ref: vendor.vendor_ref,
      doc_number: number,
      txn_date: date,
      total: amount_due,
      line_items: qb_line_items,
      pay_type: 'CheckPayment',
      check_payment: bill_check_payment
    }
  end

  def qb_line_items
    # [QuickbooksSync::LineItems::PaymentLineItem.find(line_items_scoped.last).to_quickbooks_line_item]
    line_items_scoped.collect do |line_item|
      QuickbooksSync::LineItems::PaymentLineItem.find(line_item.id).to_quickbooks_line_item
    end
  end

  def update_from_qb_response(response)
    return unless response && response.id
    update_column(:sync_token, response.sync_token)
    update_column(:qb_id, response.id)
  end

  def check_payment
    Quickbooks::Model::CheckPayment.new(check_payment_params)
  end

  def bill_check_payment
    Quickbooks::Model::BillPaymentCheck.new(bill_payment_check_params)
  end

  def check_payment_params
    {
      check_number: user.check_number,
      name_on_account: user.business_name,
      account_number: user.bank_account_number,
      bank_name: bank_name || "TODO ADD BANK NAME"
    }
  end

  def bill_payment_check_params
    {
      bank_account_ref: user.bank_account.account_ref,
      print_status: "PrintComplete",
      check_detail: chec
      # payee_address: vendor.address1
    }
  end

end
