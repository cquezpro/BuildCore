class Api::V1::VendorSerializer < Api::V1::VendorDefaultSerializer

  has_many :childrens # TODO: rename
  # has_many :line_items

  # copied from schema
  attributes :tax_id_number, :after_bill_date, :before_due_date, :after_due_date,
      :day_of_the_month, :after_recieved, :auto_amount, :end_after_payments,
      :end_autopay_over_amount, :alert_over,
      :contact_person, :business_number, :payment_end_exceed,
      :payment_end_payments, :payment_end_date, :payment_amount_fixed,
      :pay_day, :payment_date, :payment_term, :payment_end, :payment_amount,
      :routing_number, :bank_account_number, :created_by, :sync_token,
      :qb_id, :qb_account_number, :liability_account_id, :expense_account_id,
      :auto_pay_weekly, :payment_end_if_alert, :payment_status,
      :keep_due_date, :default_qb_class_id, :parent_id, :source, :qb_d_id,
      :line_items

  attributes :less_than_30_sum, :more_than_30_sum,
      :liability_accounts, :expense_accounts,
      :vendor_invoices, :archived_invoices, :invoices_count,
      :humanized_payment_status, :formated_vendor, :total_outstanding

  # Override #include? instead of defining #include_something? methods.  It's
  # so much simpler.
  #
  # If given attribute `something_id` should be filtered out, then association
  # `something` should be filtered out as well.
  def include? name
    super && filter_by_permissions(name) && filter_by_permissions(:"#{name}_id")
  end

  def filter_by_permissions name
    case name
    when *Api::V1::VendorsController::ACCOUNTING_PARAMS
      can? :read_accounting, object
    when *Api::V1::VendorsController::PAYMENT_TERMS_PARAMS
      can? :read_terms, object
    else
      true
    end
  end

  def humanized_payment_status
    case
    when object.autopay? then 'Auto Pay'
    when object.allways_mark_as_paid? then 'Mark as Paid'
    else
      ''
    end
  end

  def invoices_count
    object.invoices.count
  end

  def vendor_invoices
    {
      archived: object.invoices.by_status(8,13),
      less_than_30: object.less_than_30,
      more_than_30: object.more_than_30,
      total_count: total_incoices_scoped_count
    }
  end

  def less_than_30_sum
    object.invoices.less_than_30.sum(:amount_due)
  end

  def more_than_30_sum
    object.invoices.more_than_30.sum(:amount_due)
  end

  def total_incoices_scoped_count
    [object.less_than_30, object.more_than_30].sum(&:count)
  end

  def total_outstanding
    (less_than_30_sum || 0) + (more_than_30_sum || 0)
  end

  def line_items
    object.line_items.order("description ASC")
  end

  # def payment_term
  #   object.read_attribute(:payment_term)
  # end
end
