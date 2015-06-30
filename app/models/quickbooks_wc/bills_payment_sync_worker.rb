class QuickbooksWC::BillsPaymentSyncWorker < QBWC::Worker

  def requests(job = nil, uniq_business_name)
    user = User.find_by_uniq_business_name(uniq_business_name)
    {
      bill_payment_check_query_rq: user.invoices.where(status: [4,5,6,7,8], search_on_qb: true).where.not(txn_id: nil).collect { |e| { "TxnID" => e.txn_id } }
    }

  end

  def handle_response(r, job, request, data, uniq_business_name)
    xml = {}
    if r.is_a?(Array)
      r = r.collect {|i| i["bill_payment_check_req"] }
    else
      xml = r["xml_attributes"]
      r = [r["bill_payment_check_req"]]
    end

    user = User.find_by_uniq_business_name(uniq_business_name)
    txn_ids = []
    r.flatten.compact.each do |bill_attrs|
      if bill_attrs && bill_attrs["txn_id"]
        bill = user.invoices.where('txn_id = ?', bill_attrs['txn_id']).first
        bill.update_attributes(txn_id: bill_attrs["txn_id"], txn_number: bill_attrs["txn_number"])
        bill.update_columns(sync_qb: false, search_on_qb: false)
        txn_ids << bill_attrs["txn_id"]
      else
        bill.update_column(:sync_qb, false)
        bill.update_column(:search_on_qb, false)
      end
    end
    if xml && !xml["requestID"]
      invoices = user.invoices.where(status: [4,5,6,7], search_on_qb: true).where.not(txn_id: txn_ids)
      invoices.update_all(search_on_qb: false, sync_qb: true, txn_id: nil)
    end

  end

  def should_run?(job, uniq_business_name)
    user =  User.find_by_uniq_business_name(uniq_business_name)
    return false unless user.authorized_to_sync
    user.invoices.where(status: [4,5,6,7,8], search_on_qb: true).where.not(txn_id: nil).present?
  end

  def update_bills_payments
    requests
  end

end


