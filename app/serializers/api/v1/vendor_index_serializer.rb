class Api::V1::VendorIndexSerializer < Api::V1::CoreSerializer
  TOGGLES = VendorAlertSettings::TOGGLES.map(&:to_sym)

  attributes :id

  attributes :user_id, :name, :address1, :address2, :address3,
             :city, :state, :zip, :country, :parent_id, :expense_account

  attributes :less_than_30_sum, :more_than_30_sum,
      :humanized_payment_status, :formated_vendor, :total_outstanding


  def less_than_30_sum
    object.invoices.less_than_30.sum(:amount_due)
  end

  def more_than_30_sum
    object.invoices.more_than_30.sum(:amount_due)
  end


  def humanized_payment_status
    case
    when object.autopay? then 'Auto Pay'
    when object.allways_mark_as_paid? then 'Mark as Paid'
    else
      ''
    end
  end

  def total_outstanding
    (less_than_30_sum || 0) + (more_than_30_sum || 0)
  end
end
