class QuickbooksSync::LineItems::BillLineItem < LineItem
  Quickbooks.logger = Rails.logger
  Quickbooks.log = true

  def to_quickbooks_line_item(parent_id = nil)
    @parent_id = parent_id
    return unless get_expense_account
    Quickbooks::Model::BillLineItem.new(qb_bill_item_params)
  end

  private

  def qb_bill_item_params
    {
      id: qb_id,
      description: description,
      amount: total,
      detail_type: Quickbooks::Model::BillLineItem::ACCOUNT_BASED_EXPENSE_LINE_DETAIL,
      account_based_expense_line_detail: qb_account_based_expense

      # item_based_expense_line_detail: qb_item_expense
    }
  end

  def qb_item_expense
    Quickbooks::Model::ItemBasedExpenseLineDetail.new(qb_item_expense_details_params)
  end

  def qb_account_based_expense
    Quickbooks::Model::AccountBasedExpenseLineDetail.new(qb_account_based_details_params)
  end

  def qb_item_expense_details_params
    {
      item_id: @parent_id,
      quantity: quantity,
      unit_price: price
    }
  end

  def qb_account_based_details_params
    attrs = { tax_amount: price }
    attrs[:account_id] = get_expense_account.qb_id.to_s if get_expense_account
    attrs[:class_ref] = class_ref if qb_class
    attrs
  end

  def class_ref
    ref = Quickbooks::Model::BaseReference.new
    ref.name = qb_class.name
    ref.value = qb_class.qb_id
    ref
  end
end
