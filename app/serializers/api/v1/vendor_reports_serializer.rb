class Api::V1::VendorReportsSerializer < Api::V1::CoreSerializer
  attributes :id, :name

  attributes :outstanding, :average_yearly_volume, :total_spend_time_period,
             :percent_time_period, :bills_time_period, :num_price_changes

  def outstanding
    bills.where.not(status: [6,7,8,11,13]).sum(:amount_due).try(:to_f)
  end

  def average_yearly_volume
    return "-" unless bills.any?
    total_bills = bills.sum(:amount_due)
    bills_amount = (bills.pluck(:amount_due).compact.last || 0) - (bills.pluck(:amount_due).compact.first || 0)
    return "-" if bills_amount == 0
    (total_bills / bills_amount) * 365.25 rescue 0
  end

  def start_date
    1.year.ago.to_date
  end

  def end_date
    Date.today
  end

  def bills
    @bill ||= object.invoices.by_period(start_date, end_date).order("date ASC")
  end

  def total_spend_time_period
    bills.sum(:amount_due).to_f
  end

  def percent_time_period
    ((total_spend_time_period / total) * 100).to_f
  end

  def bills_time_period
    bills.count
  end

  def num_price_changes
    object.line_items.to_a.sum {|e| e.num_of_price_changes(start_date, end_date) }
  end

  def anual_impact
    object.line_items.to_a.sum {|e| e.num_of_price_changes(start_date, end_date) }
  end

  private

  def total
    object.user.invoices.where.not(vendor_id: nil).by_period(start_date, end_date).sum(:amount_due)
  end
end
