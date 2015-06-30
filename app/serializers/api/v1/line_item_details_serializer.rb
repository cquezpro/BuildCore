class Api::V1::LineItemDetailsSerializer < Api::V1::CoreSerializer
  attributes :id, :quantity, :code, :description, :invoice_id, :price, :total,
      :created_by, :mt_worker_id, :mt_hit_id, :mt_assignment_id,
      :liability_account_id, :expense_account_id,
      :average_price, :average_volume, :qb_class_id,
      :created_at, :updated_at, :qb_id, :sync_token
end
