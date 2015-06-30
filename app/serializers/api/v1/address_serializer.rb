class Api::V1::AddressSerializer < Api::V1::CoreSerializer
  attributes :id, :name, :address1, :address2, :city, :state, :zip,
      :created_at, :updated_at, :addressable_id, :addressable_type,
      :created_by, :user_id, :parent_id, :qb_class_id, :mt_worker_id,
      :mt_assignment_id, :mt_hit_id

  has_one :parent
  has_many :childrens
end
