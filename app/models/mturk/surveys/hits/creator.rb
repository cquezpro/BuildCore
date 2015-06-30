class Mturk::Surveys::Hits::Creator < Hit

  validate :at_least_one

  after_create :change_invoice_status
  after_create :create_mt_hit
  after_create :set_hit_attributes

  def self.try_to_create_hit
    invoice_ids = Invoice.received.where(invoice_survey_id: nil).where.not(pdf_file_name: nil).limit(5).pluck(:id)
    return unless invoice_ids.present?
    puts "><>?"
    if invoice_ids.count == 5
      create_hit(invoice_ids)
    else
      hit = Hit.for_survey.order('created_at DESC').first
      if hit && hit.created_at < 5.minutes.ago
        create_hit(invoice_ids)
      elsif hit.nil? || Rails.env.development?
        create_hit(invoice_ids)
      end
    end
  end

  def self.create_hit(invoice_ids)
    create(invoice_survey_ids: invoice_ids, hit_type: :for_survey)
  end

  def hit_title
    if Rails.env.staging?
      "STAGING: Complete the following survey"
    else
      "Complete the following survey"
    end
  end

  def description(count = 0)
    "Complete the following survey"
  end

  def hit_reward
    0.06
  end

  def change_invoice_status
    invoice_surveys.update_all(status: 2)
    true
  end

  def create_mt_hit
    return nil if Rails.env.test?
    self.mt_hit ||= RTurk::Hit.create(title: hit_title) do |hit|
      hit.description = description
      hit.max_assignments = num_assignments
      hit.reward = hit_reward
      hit.lifetime = lifetime
      hit.question(question_url,:frame_height => 1000)
      hit.qualifications.add ENV['SURVEY_QUALIFICATION'], gt: 60 unless Rails.env.development?
      hit.keywords = keywords
      hit.auto_approval_delay = auto_approval_delay
      hit.duration = assignments_duration
    end
  end

  def num_assignments
    3
  end

  def question_url
    "#{ENV['host']}/app/#/surveys"
  end

  def set_hit_attributes
    self.mt_hit_id = mt_hit.try(:id) || '1'
    self.url       = mt_hit.try(:url)|| '123'
    self.reward    = hit_reward
    self.title     = hit_title
    save
    true
  end

  def at_least_one
    errors.add(:invoice_survey_ids, 'cant be blank') unless invoice_surveys.present?
  end

  def approval_rate
    { gt: 0 }
  end

end
