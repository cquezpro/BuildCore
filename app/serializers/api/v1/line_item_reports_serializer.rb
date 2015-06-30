# Class for descending dollar view
class Api::V1::LineItemReportsSerializer < Api::V1::LineItemReportsBaseSerializer

  attributes :percent_vendor_spend, :percent_total_spend, :bills,
             :percent_of_invoices, :spark_line_data,
             :item_savings

  def percent_vendor_spend
    vendor_total = object.vendor.invoices.sum(:amount_due)
    begin
      ((item_total * 100) / vendor_total).to_i
    rescue
      nil
    end
  end

  def percent_total_spend
    total_spend = object.vendor.user.invoices.sum(:amount_due)
     begin
      ((item_total * 100) / total_spend).to_i
    rescue
      nil
    end
  end

  def item_total
    @item_total ||= object.invoice_transactions.sum(:total).try(:to_f)
  end

  def bills
    object.invoice_transactions.by_report_period(start_period_date, end_period_date).joins(:invoice).order_by_invoice_date_desc.collect(&:to_report_detail)
  end

  def vendor_total
    @vendor_total ||= object.vendor.invoices.sum(:amount_due).try(:to_f)
  end

  def total_spend
    @total_spend ||= object.invoice_transactions.sum(:total).try(:to_f)
  end

  def volume_in_period
    object.invoice_transactions.joins(:invoice).by_report_period(start_period_date, end_period_date).sum(:quantity).try(:to_f)
  end

  def percent_of_invoices
    object.invoice_transactions.count * 100 / object.vendor.user.invoices.count
  end

  def spark_line_data
    object.invoice_transactions.joins(:invoice).order_by_invoice_date_desc.order_by_total.by_report_period(start_period_date, end_period_date).collect {|e| [e.invoice.date.to_datetime.strftime("%Q"), e.total] if e.invoice && e.invoice.date && e.total }.compact
  end

  def days_in_period
    return 1 unless start_period_date && end_period_date
    (end_period_date - start_period_date).to_i
  end

  def base_formula(price, period)
    return nil if volume_in_period.zero? || days_in_period.zero?
    "%.2f" % ((total_spend - price * volume_in_period).to_d / days_in_period  * period) rescue nil
  end

  def item_savings
    {
      didnt_change: calculate_for(first_item_in_period.try(:price)),
      at_today_price: calculate_for(last_item_in_period.try(:price)),
      at_the_low_price: calculate_for(maximum_price),
      at_the_high_price: calculate_for(minimum_price)
    }
  end

  def calculate_for(price)
    {
      weekly_savings: base_formula(price, 7),
      monthy_savings: base_formula(price, 365.25/12),
      yearly_savings: base_formula(price, 365.25)
    }
  end

  # def vendor_savings
  #   {
  #     weekly_spends: object.vendor.
  #     monthly_spends:
  #     order_size:
  #   }
  # end

end
