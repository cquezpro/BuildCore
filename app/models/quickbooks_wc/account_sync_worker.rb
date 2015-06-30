class QuickbooksWC::AccountSyncWorker < QBWC::Worker

  def requests(job, uniq_business_name)
    [
      {
          account_query_rq: {
            max_returned: 100,
            active_status: "ActiveOnly",
            account_type: "Expense"
            #{}"IncludeRetElement" => "ParentRef"
          }
        },
        {
          account_query_rq: {
            max_returned: 100,
            active_status: "ActiveOnly",
            account_type: "AccountsPayable"
            #{}"IncludeRetElement" => "ParentRef"
          }
        },
        {
          account_query_rq: {
            max_returned: 100,
            active_status: "ActiveOnly",
            account_type: "Bank"
            #{}"IncludeRetElement" => "ParentRef"
          }
        },
        {
          account_query_rq: {
            max_returned: 100,
            active_status: "ActiveOnly",
            account_type: "CostOfGoodsSold"
            #{}"IncludeRetElement" => "ParentRef"
          }
        }
      ]
  end

  def handle_response(r, job, request, data, uniq_business_name)
    begin
      response = r["account_ret"]
      return unless response
      user = User.find_by_uniq_business_name(uniq_business_name)
      type = nil
      names = []
      [response].flatten.each_with_index do |res, index|
        parent_ref = res["parent_ref"]["list_id"] if res["parent_ref"]
        type = res["account_type"]
        acc = user.accounts.where(qb_d_id: res["list_id"]).first || user.accounts.where(name: res["name"]).first || user.accounts.build(name: res["name"])

        acc.attributes =  { user: user, name: res["name"], parent_ref: parent_ref,
                            account_type: type, classification: type,
                            status: res["is_active"] ? :active : :inactive,
                            qb_d_id: res["list_id"], edit_sequence: res["edit_sequence"]
                          }
        names << acc.name
        if acc.changed?
          acc.save
          acc.try_to_sync_bills
        end
        next unless index == 0
        set_defaults(user, acc, type)
      end

      user.accounts.where(qb_d_id: nil).where.not(sync_qb: true).update_all(search_on_qb: true, sync_qb: true)
      user.recalculate_accounts_defaults

    rescue => error
      Airbrake.notify_or_ignore(
        error,
        parameters: {response: r, request: request, job: job, data: data, user: uniq_business_name},
        cgi_data: ENV.to_hash,
        error_class: "QuickbooksWC::AccountWorker",
        error_message: "#{r["status_message"]}"
       )
    end
  end

  def set_defaults(user, account, account_type)
    case account_type
    when "Expense"
      user.update_column(:expense_account_id, account.id) unless user.expense_account
    when "AccountsPayable"
      user.update_column(:liability_account_id, account.id) unless user.liability_account
    when "Bank"
      user.update_column(:bank_account_id, account.id) unless user.bank_account
    end
  end

  def should_run?(job, uniq_business_name)
    user = User.find_by_uniq_business_name(uniq_business_name)
    user.authorized_to_sync
  end

  def update_user_accounts
    requests
  end
end
