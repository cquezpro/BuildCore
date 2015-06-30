class LineItem < ActiveRecord::Base
  belongs_to :worker
  belongs_to :user
  belongs_to :liability_account, class_name: "Account", foreign_key: :liability_account_id
  belongs_to :expense_account, class_name: "Account", foreign_key: :expense_account_id
  belongs_to :qb_class
  belongs_to :vendor, foreign_key: :vendor_id, inverse_of: :line_items
  has_many :invoice_transactions
  has_many :alerts, as: :alertable

  before_save :cancel_accounts_default
  before_save :sync_with_vendor_accounts
  before_save :set_default_item
  before_create :set_account_ref, :set_qb_class

  FIELDS = [:quantity, :code, :description, :price, :total]

  validates :vendor, presence: true

  validates :description, uniqueness: { scope: :vendor }

  enum created_by: [:by_user, :by_worker]

  scope :by_vendor, proc {|vendor_id| where(vendor_id: vendor_id)}
  scope :by_qb_class, proc {|qb_class_id| where(qb_class_id: qb_class_id)}
  scope :by_period, -> (start_date, end_date) { joins(invoice_transactions: [:invoice]).where("invoices.date > ? AND invoices.date < ?", (start_date || 3.months.ago.to_date), (end_date || Date.today) ) }
  scope :order_by, -> (field, direction) { order(field => direction) }
  scope :by_vendor_name, ->(bol) { joins(:vendor).order("vendors.name ASC") }

  def self.reports_scopes(by_vendor = false)
    ord = by_vendor ? "vendors.name ASC" : "description ASC"
    where.not(default_item: true).includes(vendor: [:expense_account]).joins(:vendor).order(ord)
  end

  def get_expense_account
    expense_account || invoice.vendor.expense_account || invoice.user.expense_account
  end

  def total_line_items
    invoice.invoice_transactions.not_default.sum(:total) || 0
  end

  def qb_class_id
    read_attribute(:qb_class_id) || vendor.try(:default_qb_class_id)
  end

  def expense_account_id
    read_attribute(:expense_account_id) || vendor.try(:expense_account).try(:id)
  end

  def self.uniq_items(with_json = false)
    query = by_user.group('date(invoices.date), line_items.id').select('DISTINCT ON(line_items.description) line_items.expense_account_id, line_items.id, line_items.invoice_id, line_items.description, line_items.qb_class_id, invoices.date').where.not(description: nil)#.joins(:invoice)
    if with_json
      where(id: query.collect(&:id)).as_json
    else
      where(id: query.collect(&:id))
    end

  end

  def self.find_by_worker(worker_id)
    by_worker.where(worker_id: worker_id)
  end

  def self.typeahead_search(params, current_user)
    return [] unless user = current_user || Hit.find_by(mt_hit_id: params[:hit_id]).invoice.user

    if code = params[:code].try(:downcase)
      user.line_items.select('DISTINCT ON(line_items.code) code, invoice_id, description, price').where("lower(code) LIKE ?", "#{code}%").collect {|e| e.as_json(only: [:id, :description, :code, :vendor_id]) }
    elsif description = params[:description].try(:downcase)
      user.line_items.select('DISTINCT ON(line_items.description) code, invoice_id, description, price').where("lower(description) LIKE ?", "#{description}%").collect {|e| e.as_json(only: [:id, :description, :code, :vendor_id]) }
    end
  end

  def comparison_attributes
    as_json(only: FIELDS)
  end

  def to_quickbooks_line_item
    QuickbooksSync::LineItems::BillLineItem.find(id).to_quickbooks_line_item
  end

  def last_price
    invoice_transactions.order("created_at DESC").pluck(:price).compact.first
  end

  def average_12_week
    return @average_12_week if @average_12_week
    return unless vendor
    prices = invoice_transactions.where('created_at >= ?', 12.weeks.ago).pluck(:price).compact
    return unless prices.any?
    mean = Alerts::Calculator.new(prices).mean
    @average_12_week ||= [mean.try(:zero?), mean.nil?, mean.try(:nan?)].any? ? nil : mean
  end

  def percent_difference
    return nil unless last_price && average_12_week
    percent = (last_price - average_12_week) / last_price * 100
    percent.nan? ? nil : percent
  end

  def as_json(options = {})
    if options.present?
      super(options)
    else
      super(
        includes: [:invoice],
        methods: [:last_price, :average_12_week, :percent_difference]
      )
    end
  end

  def ready_to_sync?
    acc = expense_account
    acc && acc.qb_d_id && [total, description].all?(&:present?)
  end

  def synced_qb?
    acc = expense_account
    if expense_account_id.present? && !expense_account
      update_column(:expense_account_id, vendor.expense_account_id)
    end
    acc && acc.synced_qb?
  end

  def to_quickbooks_xml!
    search_on_qb ? query_qb_desktop : to_qb_xml
  end

  def query_qb_desktop
    {
      item_non_inventory_query_rq: {
        xml_attributes: { "requestID" => id },
        full_name: description.truncate(31, omission: '')
      }
    }
  end

  def to_qb_xml
    sync_type = qb_d_id ? :item_non_inventory_mod : :item_non_inventory_add
    outher_wrapper = "#{sync_type}_rq".to_sym
    inner_wrapper = "#{sync_type}".to_sym
    hash = {
      outher_wrapper => {
        xml_attributes: { "requestID" => id },
         inner_wrapper => inner_attributes
      }
    }
  end

  def inner_attributes
    hash = {}
    sales_or_purchase_key = qb_d_id ? :sales_or_purchase_mod : :sales_or_purchase
    hash[:list_id] = qb_d_id if qb_d_id
    hash[:edit_sequence] = edit_sequence if edit_sequence
    hash.merge!({
      name: description.truncate(31, omission: ''),
      is_active: true,
      sales_or_purchase_key => sales_or_purchase_attributes
    })

    hash
  end

  def sales_or_purchase_attributes
    {
      desc: description,
      price: price,
      account_ref: { full_name: expense_account.try(:name) }
    }
  end

  def set_account_ref
    return true if self.expense_account_id.present?
    self.expense_account_id = default_expense_account_id
    self.selected_from_default_expense = true
    true
  end

  def set_qb_class
    return true if qb_class_id
    return true unless vendor
    self.qb_class_id = vendor.default_qb_class_id
    true
  end

  def default_expense_account_id
    vendor.try(:expense_account_id) || user.try(:expense_account_id)
  end

  def default_liability_account_id
    vendor.try(:liability_account_id) || user.try(:liability_account_id)
  end

  def cancel_accounts_default
    self.selected_from_default_expense = false if expense_account_id_changed? && default_expense_account_id != expense_account_id
    true
  end

  def sync_with_vendor_accounts
    return true unless vendor
    set_account_liablility_default if selected_from_default_liability
    set_account_expense_default if selected_from_default_expense || !read_attribute(:expense_account_id).present?
    true
  end

  def set_account_liablility_default
    self.liability_account_id = default_liability_account_id
    self.selected_from_default_liability = true
  end

  def set_account_expense_default
    self.expense_account_id = default_expense_account_id
    self.selected_from_default_expense = true
  end

  def sync_associated_invoices
    invoices = Invoice.joins(:invoice_transactions).where("invoice_transactions.line_item_id = ?", id).uniq
    invoices.each do |invoice|
      invoice.sync_with_quickbooks_desktop(true)
    end
  end

  def num_of_price_changes(start_date, end_date)
    invoice_transactions.by_report_period(start_date, end_date).select("DISTINCT(price)").count
  end

  def sum_anual_impact
    items = invoice_transactions.joins(:invoice).select("price, invoices.date as date").order("invoices.date ASC").pluck(:price, :date)
    first_price = items.first.first if items.first
    first_date = items.first.last if items.first
    return unless first_price && first_date
    last_price = items.last.first if items.last
    last_date = items.last.last if items.last
    return unless last_price && last_date
    begin
      value = ((first_price - last_price) * total_amount * 52 /  ((first_date - last_date).to_i / 7).try(:to_i))
      # return nil if value.
      return nil if value.zero? || value.nan?
      value.try(:to_f)
    rescue
      nil
    end
  end

  def set_default_item
    return true unless ["Tax", "Other Fee", "No description provided", "Un accounted for line items"].include?(description)
    self.default_item = true
  end
end
