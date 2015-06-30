# Class for descending dollar view
class Api::V1::LineItemReportsBaseSerializer < Api::V1::CoreSerializer

  attributes :id, :code, :description, :liability_account_id,
             :expense_account_id, :created_at, :updated_at, :sync_token,
             :qb_id, :qb_class_id, :vendor_id, :vendor_name, :total_transactions

  attributes :last_price, :average_price, :units, :total_amount, :minimum_price,
             :maximum_price, :num_of_orders, :num_of_price_changes

  attributes :matching_criteria

  def last_price
    (object.invoice_transactions.by_report_period(start_period_date, end_period_date).order_by_invoice_date_desc.first.try(:price).try(:to_f) || 0) rescue 0
  end

  def average_price
    (object.invoice_transactions.by_report_period(start_period_date, end_period_date).average(:price).try(:to_f) || 0) rescue 0
  end

  def units
    object.invoice_transactions.by_report_period(start_period_date, end_period_date).sum(:quantity) || 0
  end

  def total_amount
    object.invoice_transactions.by_report_period(start_period_date, end_period_date).sum(:total).try(:to_f) || 0
  end

  def maximum_price
    # byebug if object.id == 10326
    @maximum_price ||= object.invoice_transactions.by_report_period(start_period_date, end_period_date).maximum(:price).try(:to_f) || 0
  end

  def minimum_price
    @minimum_price ||= object.invoice_transactions.by_report_period(start_period_date, end_period_date).minimum(:price).try(:to_f) || 0
  end

  def num_of_orders # different bills
    object.invoice_transactions.by_report_period(start_period_date, end_period_date).select('DISTINCT(invoice_id)').count
  end

  def num_of_price_changes
    object.num_of_price_changes(start_period_date, end_period_date)
  end

  def vendor_id
    object.vendor.id
  end

  def first_item_in_period
    return @first_item_in_period if @first_item_in_period
    @first_item_in_period = object.invoice_transactions.joins(:invoice).by_report_period(start_date, end_date).order("invoices.date ASC").first
    @matching_criteria = false unless @last_item_in_period
    @first_item_in_period
  end

  def last_item_in_period
    return @last_item_in_period if @last_item_in_period
    @last_item_in_period = object.invoice_transactions.joins(:invoice).by_report_period(start_date, end_date).order("invoices.date DESC").first
    @matching_criteria = false unless @last_item_in_period
    @last_item_in_period
  end

  def start_period_date
    return false unless first_item_in_period
    first_item_in_period.invoice.date
  end

  def end_period_date
    return false unless last_item_in_period
    last_item_in_period.invoice.date
  end

  def matching_criteria
    @matching_criteria
  end

  def vendor_name
    object.vendor.name
  end

  protected

  def start_date
    return nil unless @options[:serializer_params]
    date = @options[:serializer_params][:start_date] || object.invoice_transactions.joins(:invoice).order_by_invoice_date_desc.last.try(:date) || 5.years.ago.to_date
    date.is_a?(Date) ? date : date.to_date
  end

  def end_date
    return nil unless @options[:serializer_params]
    date = @options[:serializer_params][:end_date] || Date.today
    date.is_a?(Date) ? date : date.to_date
  end

end
