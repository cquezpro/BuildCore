class MturkNotificationsWorker
  include Sidekiq::Worker

  def perform
    return
    # return true if Rails.env.sandbox?
    hits = Hit.for_survey.where(submited: false).where("created_at <= ?", 4.hours.ago)
    return unless hits.any?
    hit_found = false
    hits.each do |hit|
      rhit = RTurk::GetHIT(hit_id: hit.mt_hit_id)
      if rhit
        hit_found = true
        break
      end
    end

    return unless hit_found
    page = 1
    limit = 100

    loop do
      offset = (page-1) * limit
      workers_ids = Worker.where('score >= ?', Worker::APPROVAL_LEVEL).limit(limit).offset(offset).unblocked.pluck(:mt_worker_id)
      return unless workers_ids.any?
      url = "https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=scotty+alto"

      RTurk::NotifyWorkers(worker_ids: workers_ids,
        subject: "Qualified HIT available",
        message_text: "As a valued worker we wanted to let you know there is a qualified HIT waiting for you: #{url}. MAKE SURE YOU ARE LOGGED INTO TURK BEFORE CLICKING THE LINK.
        If you cannot find the hit/looked blocked please search for Scotty Alto. If no HITs appear it means the HIT has already been completed.")
      page += 1
      break if workers_ids.size < limit
    end

  end
end
