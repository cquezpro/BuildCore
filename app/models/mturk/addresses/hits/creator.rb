class Mturk::Addresses::Hits::Creator < Hit
  validates :mt_hit_id, :url, presence: true

  before_validation :create_mt_hit
  before_validation :set_hit_attributes

  def hit_title
    # "Development testing -- #{HIT_VERSION}: Extract summary information from #{invoices_for_invoice_moderation.count} invoices"
    if Rails.env.staging?
      "STAGING: Fill in the locations fields"
    else
      "Fill in the locations fields"
    end
  end

  def description(count = 0)
    "Fill in the locations fields"
  end

  def hit_reward
    0.04
  end

  def create_mt_hit
    return nil if Rails.env.test?
    self.mt_hit ||= RTurk::Hit.create(title: hit_title) do |hit|
      hit.description = description
      hit.max_assignments = num_assignments
      hit.reward = hit_reward
      hit.lifetime = lifetime
      hit.question(question_url,:frame_height => 1000)
      hit.qualifications.add :approval_rate, approval_rate
      hit.keywords = keywords
      hit.auto_approval_delay = auto_approval_delay
      hit.duration = assignments_duration
    end
  end

  def num_assignments
    2
  end

  def question_url
    "#{ENV['host']}/app/#/address"
  end
end
