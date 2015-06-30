class InvoiceModerations::UpdaterBase < InvoiceModeration
  attr_accessor :mt_assignment_id, :mt_hit_id, :mt_worker_id

  normalize_attribute :address1, :address2, :zip, with: [:squish, :blank] do |value|
    value.present? && value.is_a?(String) ? value.gsub(/\.|\$|\@/, '').downcase : value
  end

  normalize_attribute :state, with: [:squish, :blank] do |value|
    value.present? && value.is_a?(String) ? value.upcase : value
  end

  normalize_attribute :city, with: [:squish, :blank] do |value|
    value.present? && value.is_a?(String) ? value.gsub(/\.|\$|\@/, '').titleize : value
  end

  normalize_attribute :name, with: [:squish, :blank] do |value|
    value.present? && value.is_a?(String) ? value.gsub(/\.|\$|\@/, '').downcase.titleize : value
  end

  before_validation :set_submited
  before_validation :set_worker

  before_update :build_assignment, unless: :assignment
  before_save :save_assignment

  def submited_count
    invoice.invoice_moderations.submited.count
  end

  private

  def set_submited
    self.status = :submited
  end

  def set_worker
    self.worker = Worker.find_or_create_by(mt_worker_id: mt_worker_id)
  end

  def build_assignment
    self.assignment = Mturk::Assignments::Creator.build_from(mt_assignment_id, worker, hit)
  end

  def save_assignment
    assignment.try(:save)
    true
  end

  def vendor_status?
    moderation_type == "vendor"
  end

  def amount_due_status?
    moderation_type == "amount_due"
  end

  def both_invoice_moderations_submited?(scope = :default)
    submited? && sibling_record(scope).submited?
  end
end
