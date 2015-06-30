class QuickbooksWC::QbClassWorker < QBWC::Worker

  def requests(job, uniq_business_name)
    user = User.find_by_uniq_business_name(uniq_business_name)
    qb_class = user.qb_classes.where(sync_qb: true).first
    qb_class.sync_qb_desktop!
  end

  def handle_response(r, job, request, data, uniq_business_name)
    xml = r["xml_attributes"]
    qb_class_attrs = r["class_ret"]
    qb_class = QBClass.find(xml["requestID"])
    if xml["statusCode"] == "3200"
      qb_class.update_column(:edit_sequence, qb_class_attrs["edit_sequence"])
    elsif xml["statusCode"] == "0" && xml["requestID"] && !qb_class.search_on_qb
      qb_class.update_attributes(qb_d_id: qb_class_attrs["list_id"], edit_sequence: qb_class_attrs["edit_sequence"])
      qb_class.update_column(:sync_qb, false)
    elsif qb_class_attrs && qb_class_attrs["list_id"] && qb_class.search_on_qb
      qb_class.update_attributes(qb_d_id: qb_class_attrs["list_id"], edit_sequence: qb_class_attrs["edit_sequence"])
    end
    qb_class.update_column(:search_on_qb, false)
    reset_job(uniq_business_name)
  end

  def should_run?(job, uniq_business_name)
    user =  User.find_by_uniq_business_name(uniq_business_name)
    return false unless user.authorized_to_sync
    user.qb_classes.where(sync_qb: true).present?
  end

  def update_classes
    requests
  end

  def reset_job(uniq_business_name)
    QBWC.get_job(:update_classes).reset if should_run?(self, uniq_business_name)
  end
end
