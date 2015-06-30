# Pay worker and recalculate new score training lvl and new earning.
class Workers::Payment < Worker

  validate :new_earning

  before_save :calculate_earning_rate

  def self.payment_for(worker, reward, add_score = false)
    instance = find(worker.id)
    instance.pay!(reward, add_score)
  end

  def pay!(reward, add_score = false)
    self.earning = earning ? earning + reward : reward
    if add_score
      self.score = score ? score + 1 : 1
    end
    self.block_counter = 0
    self.blank_submission_counter = 0
    save
  end

  private

  def calculate_earning_rate
    self.earning_rate = self.earning / hits.count == 0 ? 1 : hits.count
  end

  def new_earning
    return true if earning_changed?
    errors.add(:earning, "can't be the same earning as before.")
  end
end
