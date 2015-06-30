class Api::V1::InvoiceTransactionSerializer < Api::V1::CoreSerializer
  attributes :id, :line_item_id, :invoice_id, :quantity, :total, :price,
             :discount, :average_price, :average_volume, :created_at,
             :updated_at, :description, :code, :expense_account_id,
             :automatic_calculation, :alerts_text_to_sentence, :qb_class_id,
             :default_item

  has_many :alerts

  def expense_account_id
    object.line_item.expense_account_id || object.line_item.vendor.expense_account_id || object.line_item.vendor.user.expense_account_id
  end

  def qb_class_id
    object.line_item.qb_class_id || object.line_item.vendor.default_qb_class_id || object.line_item.vendor.user.default_class_id
  end

  def alerts_text_to_sentence
    alerts.pluck(:sms_text).to_sentence
  end
end
