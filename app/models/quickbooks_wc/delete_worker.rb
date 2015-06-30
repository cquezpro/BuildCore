class QuickbooksWC::DeleteWorker < QBWC::Worker

  def should_run?(job, uniq_business_name)
    user =  User.find_by_uniq_business_name(uniq_business_name)
    user.authorized_to_sync
  end

  def delete_objects
    requests
  end
end
