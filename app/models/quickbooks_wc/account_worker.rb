class QuickbooksWC::AccountWorker < QBWC::Worker

  def requests(job, uniq_business_name)
    user = User.find_by_uniq_business_name(uniq_business_name)
    account = user.accounts.where(sync_qb: true).where.not(name: nil).first
    account.sync_qb_desktop!
  end

  def handle_response(r, job, request, data, uniq_business_name)
    r = r.is_a?(Array) ? r.first : r
    user = User.find_by_uniq_business_name(uniq_business_name)
    xml = r["xml_attributes"]
    account_attrs = r["account_ret"]
    account = user.accounts.find(xml["requestID"])

    if account.request_number > 4
      account.update_columns(sync_qb: false, search_on_qb: false)
    end
    account.update_column(:request_number, account.request_number + 1)

    begin
      if xml["statusCode"] == "0" && xml["requestID"] && !account.search_on_qb
        account.update_attributes(qb_d_id: account_attrs["list_id"], edit_sequence: account_attrs["edit_sequence"])
        account.update_column(:sync_qb, false)
        account.try_to_sync_bills
      elsif account_attrs && account_attrs["list_id"] && account.search_on_qb
        parent_ref = account_attrs["parent_ref"]["list_id"] if account_attrs["parent_ref"]
        account.update_attributes(qb_d_id: account_attrs["list_id"], edit_sequence: account_attrs["edit_sequence"], name: account_attrs["name"], account_type: account_attrs["account_type"], parent_ref: parent_ref)
        account.try_to_sync_bills
        account.update_column(:sync_qb, false)
      elsif xml["statusCode"] === "500"
        account.update_columns(search_on_qb: false, sync_qb: true)
      elsif xml["statusCode"] === "3120"
        account.update_columns(search_on_qb: false, sync_qb: true, parent_ref: nil)
      else
        account.update_column(:sync_qb, false)
      end
    rescue => error
      Airbrake.notify_or_ignore(
        error,
        parameters: {response: r, request: request, job: job, data: data, user: uniq_business_name},
        cgi_data: ENV.to_hash,
        error_class: "QuickbooksWC::AccountWorker",
        error_message: "#{r["status_message"]}"
       )
      account.update_columns(search_on_qb: false, sync_qb: false)
    ensure
      reset_job(user.uniq_business_name)
    end
  end

  def should_run?(job = nil, uniq_business_name)
    user =  User.find_by_uniq_business_name(uniq_business_name)
    return false unless user.authorized_to_sync
    user.accounts.where(sync_qb: true).where.not(name: nil).present?
  end

  def update_accounts
    requests
  end

  def reset_job(uniq_business_name)
    QBWC.get_job(:update_accounts).reset if should_run?(self, uniq_business_name)
  end
end
