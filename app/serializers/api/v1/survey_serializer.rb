class Api::V1::SurveySerializer < Api::V1::CoreSerializer
  attributes :id, :is_invoice, :vendor_present, :address_present,
      :amount_due_present, :is_marked_through,
      :invoice_id, :worker_id, :mt_hit_id, :mt_assignment_id,
      :mt_worker_id, :created_at, :updated_at,
      :address_reference, :user_addresses, :locations_feature

  def user_addresses
    object.invoice.user.formated_addresses
  end

  def locations_feature
    object.invoice.user_locations_feature
  end

end
