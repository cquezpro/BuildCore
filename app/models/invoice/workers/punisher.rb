class Workers::Punisher < Worker
  after_update :block_worker, if: :should_block_worker?

  def punish_worker!
    self.score = score ? score - 2  : 0
    self.block_counter = block_counter ? block_counter + 1 : 0
    save
  end

  def punish_by_blank_submission!
    self.blank_submission_counter += 1
    save
  end

  private

  def block_worker
    return unless mt_worker_id.present?
    RTurk::BlockWorker(worker_id: mt_worker_id, reason: reason ) unless Rails.env.test?
    blocked!
    true
  end

  def reason
    "Poor quality, as other workers doesn't agree with you."
  end

  def should_block_worker?
    return false if blocked?
    return true if block_counter >= 5
    return true if score <= 0 && invoice_moderations.count >= 5 && score_was >= 1
    return true if blank_submission_counter >= 2
    false
  end
end
