class QuickbooksWC::QbClassSyncWorker < QBWC::Worker

  def requests(job, uniq_business_name)
    {
      class_query_rq: {
        max_returned: 100,
        active_status: "ActiveOnly"
      }
    }
  end

  def handle_response(r, job, request, data, uniq_business_name)
    response = r["class_ret"]
    return unless response
    user = User.find_by_uniq_business_name(uniq_business_name)
    [response].flatten.each_with_index do |res, index|
      parent_ref = res["parent_ref"]["list_id"] if res["parent_ref"]
      to_default = QBClass.find_or_create_by(user: user, name: res["name"]) do |qb_class|
        qb_class.parent_ref = parent_ref
      end
      next unless index == 0
      user.update_column(:default_class_id, to_default.id)
      user.recalculate_accounts_defaults
    end
    QBWC.delete_job(job)
  end

  def should_run?(job, uniq_business_name)
    user =  User.find_by_uniq_business_name(uniq_business_name)
    return false unless user.authorized_to_sync
    ! user.qb_classes.any?
  end

  def sync_qb_classes
    requests
  end
end
