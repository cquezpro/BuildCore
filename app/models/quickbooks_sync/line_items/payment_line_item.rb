class QuickbooksSync::LineItems::PaymentLineItem < LineItem

  def to_quickbooks_line_item
    Quickbooks::Model::BillPaymentLineItem.new(payment_params)
  end

  private

  def payment_params
    {
      # id: qb_id,
      # description: description,
      amount: total,
      # detail_type: Quickbooks::Model::BillPaymentLineItem::PAYMENT_LINE_DETAIL,
      linked_transactions: [transaction]
    }
  end

  def qb_account_based_expense
    Quickbooks::Model::AccountBasedExpenseLineDetail.new(qb_account_based_details_params)
  end

  def qb_account_based_details_params
    {
      tax_amount: price,
      account_id: expense_account.qb_id
    }
  end

  def transaction
    Quickbooks::Model::LinkedTransaction.new(linked_transaction_params)
  end

  def linked_transaction_params
    {
      txn_id: invoice.qb_id,
      txn_line_id: qb_id,
      txn_type: "Bill"
    }
  end
end
