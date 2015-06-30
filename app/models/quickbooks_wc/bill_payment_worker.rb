class QuickbooksWC::BillPaymentWorker < QBWC::Worker

  def requests(job = nil, uniq_business_name)
    user = User.find_by_uniq_business_name(uniq_business_name)
    bill = user.invoices.joins(:vendor).where(sync_qb: true, status: [7, 8]).where.not(txn_id: nil).where.not("vendors.qb_d_id = ?", nil).first
    bill.payment_xml!
  end

  def handle_response(r, job, request, data, uniq_business_name)
    xml = r["xml_attributes"]
    bill_attrs = r["bill_ret"]
    if xml["statusCode"] == "0" && xml["requestID"]
      bill = Invoice.find(xml["requestID"])
      bill.update_attributes(qb_d_id: bill_attrs["list_id"], edit_sequence: bill_attrs["edit_sequence"])
      bill.update_column(:sync_qb, false)
    end
  end

  def should_run?(job, uniq_business_name = nil)
    user =  User.find_by_uniq_business_name(uniq_business_name)
    return false unless user.authorized_to_sync
    user.invoices.joins(:vendor).where(sync_qb: true, status: [7, 8]).where.not(txn_id: nil).where.not("vendors.qb_d_id = ?", nil).present?
  end

  def update_bills
    requests
  end

end


