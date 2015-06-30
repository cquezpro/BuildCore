class Api::V1::AccountSerializer < Api::V1::CoreSerializer
  attributes :id, :qb_id, :sync_token, :name, :user_id, :parent_id,
      :sub_account, :account_type, :account_sub_type, :classification, :status,
      :created_at, :updated_at
end
