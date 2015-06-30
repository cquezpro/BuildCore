class Worker < ActiveRecord::Base
  has_many :assignments
  has_many :hits, through: :assignments
  has_many :invoice_moderations
  has_many :comments
  has_many :line_items
  has_many :invoice_pages
  has_many :turk_transactions
  has_many :surveys
  has_many :responses, inverse_of: :worker
  has_many :worker_messages

  before_save :grant_qualification_if_necesary
  before_save :send_warning_notification!, if: :should_send_warning_notification?
  after_save :block_worker!
  after_save  :recalculate_level

  enum status: [:unblocked, :blocked]

  enum worker_level: [:training_camp, :rookie, :scholar, :rising_start, :superstar]

  attr_reader :line_item_match

  APPROVAL_LEVEL = 10

  def to_s
    mt_worker_id
  end

  def as_json(options = {})
    super(methods: [:level])
  end

  def level
    worker_level.humanize.titleize
  end

  def grant_qualification(qualification_type_id)
    return false if grant_time.present?
    return true if Rails.env.test?
    begin
      response = RTurk::AssignQualification(
      qualification_type_id: qualification_type_id,
      worker_id: mt_worker_id,
      send_notification: "Thanks for your hard work! You are now eligible for doing survey hits!",
      integer_value: 95
    )
    rescue RTurk::InvalidRequest
      update_column(:grant_time, DateTime.now)
    end
    update_column(:grant_time, DateTime.now) if response
  end

  def add_line_item_match
    line_item_match
    @line_item_match += 1
  end

  def line_item_match
    @line_item_match ||= 0
  end

  def add_score
    self.score += 1
  end

  def punish
    self.score -= 2
  end

  def error_response_rate
    return 0 if responses.count == 0 || responses.rejected.count < 20
    responses_count = responses.count
    error_count = responses.rejected.count
    (error_count * 100) / responses_count
  end

  def should_send_warning_notification?
    !warning_notification_sent_at && error_response_rate > 5
  end

  def send_warning_notification!
    return true if Rails.env.test? || notifications_disabled
    return true if read_attribute(:warning_notification_sent_at).present?
    update_column(:warning_notification_sent_at, Time.now)
    response = responses.rejected.where.not(assignment_id: nil).order("created_at DESC").last
    return unless response.present?
    subject = "[Warning] 5% of your responses have had issues."
    body = "We wanted to let you know on assignment #{response.assignment.mt_assignment_id}, you responded #{response.field_response} but the accepted response was #{response.expected_response.try(:to_s)}.  No worries we realize everyone is human and makes mistakes.  We allow up to a 10% error rate, and you are currently at #{error_response_rate}%.  You have completed #{assignments.count} assignments for us and this only applies after completing 10 assignments. We allow a grace period :)!"
    RTurk::NotifyWorkers(worker_ids: [mt_worker_id],
      subject: subject,
      message_text: body)
    send_email!(subject += " - #{mt_worker_id}", body)
  end

  def should_block_worker?
    return false if blocked?
    return false if assignments.count < 10
    return true if error_response_rate > 10
    false
  end

  def block_worker!
    return true unless should_block_worker?
    reason = "Sorry you have been blocked from Scotty Alto Assignments. Below are the assignments where you had an error."
    message_body = reason
    email_body = reason
    last_response = responses.rejected.today.last
    responses.rejected.find_each do |response|
      new_line = "On assignment #{response.assignment.mt_assignment_id} you responded #{response.field_response} and the accepted response was #{response.expected_response.try(:to_s)}.\n"
      email_body += new_line
      if message_body.size > 4093 || (message_body.size + new_line.size) > 4093
        send_message!(message_body)
        message_body = new_line
      else
        message_body += new_line
        send_message!(message_body) if response == last_response
      end
    end

    send_message!("These constitute 10% of the blanks completed. At this point you have been blocked due to accuracy.")
    mt_block!
    self.status = :blocked
    self.blocked_at = Date.time.now
    save
    subject = "[Blocked] Worker blocked #{mt_worker_id}"
    send_email!(subject, email_body)
    true
  end

  def send_daily_digest!
    default_message = "Wanted to give you a heads up you had a couple of errors today here they are: \n"
    message_body = default_message
    last_response = responses.rejected.today.last
    responses.rejected.today.find_each do |response|
      new_line = "On assignment #{response.assignment.mt_assignment_id} you responded #{response.field_response} and the accepted response was #{response.expected_response.try(:to_s)}.\n"
      if message_body.size > 4095 || (message_body.size + new_line.size) > 4095
        send_message!(message_body)
        message_body = default_message += new_line
      else
        message_body += new_line
        send_message!(message_body) if response == last_response
      end
    end
  end

  def send_message!(string)
    return unless [Rails.env.staging?, Rails.env.production?, notifications_disabled].any?
    RTurk::NotifyWorkers(worker_ids: [mt_worker_id],
    subject: "[Heads Up] You had a mismatch",
    message_text: string)
  end

  def pay_daily_bonus!
    reward = 0
    assignments.where('created_at >= ?', Date.today).find_each do |assignment|
      reward += assignment.hit.reward
    end
    reward = reward + reward * 0.15 if rising_start?
    reward = reward + reward * 0.50 if superstar?
    return if reward.zero?
    RTurk::GrantBonus.create({
      assignment_id: mt_assignment_id,
      amount: reward,
      feedback: "You have been rewarded with #{reward} for you work!",
      worker_id: mt_worker_id
    })
  end

  def unblock!(reason = "Reseted scores!.")
    RTurk::UnblockWorker(worker_id: mt_worker_id, reason: reason)
    self.status = :unblocked
    self.blocked_at = nil
    save
  end

  def mt_block!(reason = "Poor quality.")
    RTurk::BlockWorker(worker_id: mt_worker_id, reason: reason) unless Rails.env.test?
  end

  def reset!(reason = nil)
    responses.destroy_all
    assignments.destroy_all
    unblock!(reason) if blocked?
    self.score = 0
    self.status = :unblocked
    save
  end

  def self.unblock_in_batches(ids, reason = nil)
    where(id: ids).find_each do |worker|
      worker.unblock!(reason)
    end
  end

  def self.reset_in_batches(ids, reason = nil)
    where(id: ids).find_each do |worker|
      worker.reset!(reason)
    end
  end

  private

  def recalculate_level # after save
    level = case
    when score > 1500 && has_superstar_level?
      :superstar
    when score > 1000 && has_rising_star_level?
      :rising_start
    when score > 50 && has_scholar_level?
      :scholar
    when score > 50
      :rookie
    when score < 50
      :training_camp
    else
      :training_camp
    end
    update_column(:worker_level, Worker.worker_levels[level])
  end

  def has_superstar_level?
    calculate_level(1500, 0.05)
  end

  def has_rising_star_level?
    calculate_level(1000, 0.15)
  end

  def has_scholar_level?
    calculate_level(50, 0.5)
  end

  def calculate_level(score, percent)
    total = Worker.where("score > ?", score).count
    limit_rows = (percent * total).ceil
    Worker.order("score DESC").limit(limit_rows).pluck(:id).include?(id)
  end

  def grant_qualification_if_necesary
    return true if score <= APPROVAL_LEVEL || grant_time.present?
    begin
      grant_qualification(ENV['SURVEY_QUALIFICATION'])
    rescue => e
      Airbrake.notify(e)
    end
    true
  end

  def send_email!(subject, body)
    DefaultNotifier.send_worker_message(subject, body).deliver
  end

end
