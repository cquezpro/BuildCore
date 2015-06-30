class QuickbooksWC::BillWorker < QBWC::Worker

  def requests(job = nil, uniq_business_name)
    user = User.find_by_uniq_business_name(uniq_business_name)
    if user.invoices.where(status: [4,5,6,7,8], search_on_qb: true).where("request_number < ?", 4).where.not(txn_id: nil).any?
      {
        bill_query_rq: user.invoices.where(status: [4,5,6,7,8], search_on_qb: true).where("request_number < ?", 4).where.not(txn_id: nil).collect {|e| { "TxnID" => e.txn_id, include_line_items: true } }

      }
    elsif bill = user.invoices.where(sync_qb: true, status: [4,5,6,7,8,11]).where("request_number < ?", 4).first
      if bill.request_number > 4
        bill.update_columns(sync_qb: false, search_on_qb: false)
      end
      bill.update_column(:request_number, bill.request_number += 1)
      bill.to_qb_xml
    end

  end

  def handle_response(response, job, request, data, uniq_business_name)
    response_code = response.is_a?(Array) ? false : response['statusCode'] || response["xml_attributes"]['statusCode']
    return skip_invoice(response, uniq_business_name, request) if !response.is_a?(Array) && response_code != '0' && response["xml_attributes"] && response["xml_attributes"]["requestID"]
    return delete_invoice(response["xml_attributes"]["requestID"], uniq_business_name, response["time_deleted"]) if !response.is_a?(Array) && response["txn_del_type"].present? && response["txn_id"].present? && response["xml_attributes"]["requestID"]
    r, xml, response_type = parse_response(response)

    begin
      bill_ids = []
      user = User.find_by_uniq_business_name(uniq_business_name)
      r.flatten.compact.each do |bill_attrs|
        prepared_query = {}
        if xml["requestID"].present?
          prepared_query[:id] = xml["requestID"]
        elsif bill_attrs["txn_id"]
          prepared_query[:txn_id] = bill_attrs["txn_id"]
        end

        bill = user.invoices.where(prepared_query).first
        next unless bill

        if bill_attrs && bill_attrs["txn_id"]
          bill_ids << bill_attrs["txn_id"]
          bill_attribute = response_type == :bill_payment ? :bill_payment_txn_id : :txn_id

          bill.update_attributes(edit_sequence: bill_attrs["edit_sequence"], bill_attribute => bill_attrs["txn_id"], txn_number: bill_attrs["txn_number"])
          bill.update_column(:request_number, 0)
          attrs = [bill_attrs["item_line_ret"], bill_attrs["expense_line_ret"]].flatten.compact
          attrs.each_with_index do |line_ret, index|
            description = line_ret["desc"] || line_ret["memo"]
            item = bill.invoice_transactions.joins(:line_item).where("line_items.description = ?", description).first
            next unless item
            txn_id = line_ret["txn_line_id"]
            item.update_columns(txn_line_id: txn_id, order_number: index)
          end

          # dont set sync qb to false if the bill is paid
          if bill.bill_paid && !bill.qb_bill_paid_at? && (bill.archived? || bill.wire_sent?)
            bill.update_columns(sync_qb: true, search_on_qb: false)
          elsif bill.marked_as_paid? && (bill.archived? || bill.wire_sent?) && response_type != :bill_payment
            bill.update_columns(sync_qb: true, search_on_qb: false)
          else
            bill.update_columns(sync_qb: false, search_on_qb: false)
          end

          if response_type == :bill_payment
            bill.update_columns(bill_paid: true, qb_bill_paid_at: DateTime.now, resending_payment_at: nil)
          end
        else
          bill.update_column(:sync_qb, false) unless bill.deleted?
          bill.update_column(:search_on_qb, false)
        end
      end

      if response_type == :bill_query
        invoices = user.invoices.where(status: [4,5,6,7,8], search_on_qb: true).where.not(txn_id: bill_ids)
        invoices.update_all(search_on_qb: false, sync_qb: true, txn_id: nil)
      end
    rescue => error
      Airbrake.notify_or_ignore(
        error,
        parameters: response,
        cgi_data: ENV.to_hash,
        error_class: "QuickbooksWC::BillWorker",
        error_message: "#{response["status_message"]}"
       )
    ensure
      reset_job(uniq_business_name)
    end
  end

  def should_run?(job, uniq_business_name)
    user =  User.find_by_uniq_business_name(uniq_business_name)
    user.invoices.where(vendor_id: nil).update_all(sync_qb: false, search_on_qb: false)
    return false unless user.authorized_to_sync
    return false unless user.bank_account && user.bank_account.qb_d_id
    return false if user.first_sync?
    return true if user.invoices.where(status: [4,5,6,7,8], search_on_qb: true).where("request_number < ?", 4).where.not(txn_id: nil, vendor_id: nil).any?
    user.invoices.where(sync_qb: true, status: [4,5,6,7,8,11]).where("request_number < ?", 4).where.not(vendor_id: nil).present?
  end

  def update_bills
    requests
  end

  def reset_job(uniq_business_name)
    QBWC.get_job(:update_bills).reset if should_run?(self, uniq_business_name)
  end

  def skip_invoice(response, uniq_business_name, request)
    user = User.find_by_uniq_business_name(uniq_business_name)
    id = response["requestID"] || response["xml_attributes"]["requestID"]
    bill = user.invoices.where(id: id).first
    if bill
      bill.update_column(:sync_qb, false)
      bill.update_column(:search_on_qb, false)
    end

    begin
      raise "Error"
    rescue => e
      notify_with_airbrake(e, request, response)
    end


    reset_job(uniq_business_name)
  end

  def delete_invoice(id, uniq_business_name, qb_d_deleted_at)
    user = User.find_by_uniq_business_name(uniq_business_name)
    invoice = user.invoices.find(id)
    if invoice.resending_payment_at.present? && !invoice.deleted?
      invoice.update_columns(resending_payment_at: nil, qb_bill_paid_at: nil, status: 5, bill_paid: true, sync_qb: false)
    else
      invoice.update_columns(sync_qb: false, qb_d_deleted_at: qb_d_deleted_at, bill_payment_txn_id: nil)
    end
  end

  def parse_response(response)
    xml = {}
    response_type = false
    if response.is_a?(Array)
      response_type = :bill_query
      r = response.collect {|i| i["bill_ret"] }
    else
      xml = response["xml_attributes"]
      response_type = response["bill_payment_check_ret"].present? ? :bill_payment : :bill_sync
      r = [response["bill_ret"], response["bill_payment_check_ret"]].compact.flatten
    end
    [r, xml, response_type]
  end

  def notify_with_airbrake(error, request, response)
    Airbrake.notify_or_ignore(error,
      parameters: {request: request.to_json, response: response.to_json},
      error_class: "QuickbooksWC::BillWorker",
      error_message: "#{response["status_message"]}"
     )
  end

end


