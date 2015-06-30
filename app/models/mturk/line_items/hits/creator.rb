class Mturk::LineItems::Hits::Creator < Hit
  validates :invoice, presence: true

  after_create :create_mt_hit

  def hit_title
    "Data Entry: Enter line items from bill, up to $1.00 per bill with bonuses."
  end

  def description(count = 0)
    if Rails.env.staging?
      "STAGING: Extract line items from #1 invoice."
    else
      "Extract line items from #1 invoice."
    end
  end

  def question_url
    "#{ENV['host']}/app/#/invoice/noId/line-items-aws"
  end

  def create_mt_hit
    return unless invoice
    return true if Rails.env.test?
    self.mt_hit ||= RTurk::Hit.create(title: hit_title) do |hit|
      hit.description = description()
      hit.max_assignments = num_assignments
      hit.reward = hit_reward
      hit.lifetime = lifetime
      hit.question(question_url,:frame_height => 1000)
      hit.qualifications.add :approval_rate, approval_rate
      hit.keywords = keywords
      hit.auto_approval_delay = auto_approval_delay
      hit.duration = 60.minutes.to_s
    end
    set_hit_attributes
    save
    true
  end

  def self.create_with(invoice)
    invoice.pdf_total_pages.times do |i|
      next unless invoice.can_create_hit_for_page?(i + 1)
      next if invoice.hits.for_line_item.where(page_number: i + 1).present?
      create(invoice: invoice, hit_type: :for_line_item, page_number: i + 1)
    end
  end
end
