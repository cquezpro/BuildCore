class InvoiceTransaction < ActiveRecord::Base
  DEFAULT_ITEM_NAME = 'Un accounted for line items'

  belongs_to :invoice
  belongs_to :line_item
  belongs_to :vendor, inverse_of: :invoice_transactions
  has_many :alerts, as: :alertable

  validates :invoice, :line_item, presence: true

  delegate :description, :code, :expense_account, :qb_class, to: :line_item
  delegate :total_line_items, to: :invoice

  before_save :set_default_item, :set_total
  before_destroy :destroy_alerts
  after_save :watch_for_alerts
  after_commit :set_last_price

  scope :not_default, proc { where.not(default_item: true) }
  scope :by_period, -> (start_date, end_date) { joins(:invoice).where("invoices.date >= ? AND invoices.date <= ?", (start_date || 3.months.ago.to_date), (end_date || Date.today) ) }
  scope :by_report_period, -> (start_date, end_date) { joins(:invoice).where("invoices.date >= ? AND invoices.date <= ?", (start_date || 1.years.ago.to_date), (end_date || Date.today) ) }
  scope :order_by_invoice_date_desc, -> { order("invoices.date DESC") }
  scope :order_by_total, -> { order("total DESC") }

  counter_culture :line_item, column_name: :total_transactions, delta_column: :total

  def get_expense_account
    line_item.expense_account || line_item.vendor.expense_account || invoice.user.expense_account
  end

  def to_quickbooks_line_item
    QuickbooksSync::LineItems::BillLineItem.find(id).to_quickbooks_line_item
  end

  def set_default_item
    return true unless description == DEFAULT_ITEM_NAME || description == "Tax" || description == "Other Fees"
    self.default_item = true
    self.automatic_calculation = true if description == DEFAULT_ITEM_NAME
    true
  end

  def to_qb_item_line
    hash = {}
    hash[:txn_line_id] = txn_line_id if txn_line_id && invoice.txn_id
    return nil unless get_expense_account && get_expense_account.qb_d_id
    hash[:account_ref] = { "ListID" => get_expense_account.qb_d_id }
    hash.merge!({
      amount: '%.2f' % total.try(:to_f) || 0,
      memo: description
    })
    hash.merge!({class_ref: { "ListID" => qb_class.qb_d_id}}) if qb_class && qb_class.qb_d_id
    hash
  end

  def last_ten_items
    InvoiceTransaction.where('line_items.id = ?', line_item_id)
    .where("invoices.date <= ?", invoice.date)
    .where.not(id: id)
    .joins(:line_item, :invoice).order('invoice_transactions.created_at DESC')
  end

  def self.create_default_transaction(invoice)
    create(
      total: invoice.amount_due, quantity: 1,
      line_item: invoice.vendor.default_item
    )
  end

  def self.default_invoice_transaction(item_id)
    transaction = find_or_create_by(default_item: true, line_item_id: item_id, automatic_calculation: true)
    transaction.send :set_total
    transaction
  end

  def to_report_detail
    {
      id: invoice.id,
      date: (invoice.try(:date) || invoice.try(:created_at)),
      price: price,
      volume: quantity,
      total: total,
      pdf_url: invoice.try(:pdf_url)
    }
  end

  private

  def set_total
    return set_automatic_total if automatic_calculation
    return true if total.present?
    return true unless quantity && price
    self.total = quantity * price
    true
  end

  def set_automatic_total
    value = (invoice.amount_due || 0) - ( invoice.tax || 0) - (invoice.other_fee || 0) - total_line_items
    self.total = value
    true
  end

  def watch_for_alerts
    unless invoice.deleted? || default_item?
      Alerts::InvoiceTransactionAlertObserver.new(self).watch_for_all
    end
    true
  end

  def destroy_alerts
    alerts.destroy_all
  end

  def set_last_price
    return true unless price.present?
    line_item.update_attributes(last_price: line_item.invoice_transactions.order("created_at desc").first.try(:price) )
    true
  end
end
