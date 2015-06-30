class Api::V1::LineItemSerializer < Api::V1::CoreSerializer
  attributes :id, :code, :description, :invoice_id,
      :created_by, :liability_account_id, :expense_account_id,
      :qb_class_id, :created_at, :updated_at, :sync_token, :qb_id,
      :average_volume, :average_price, :last_price, :average_12_week, :percent_difference

end
