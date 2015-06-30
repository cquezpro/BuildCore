class Api::V1::DashboardInvoiceSerializer < Api::V1::CoreSerializer
  attribute :id

  attributes :accountant_approved, :regular_approved, :pdf_url,
    :humanized_status, :comparation_humanized_status,
    :humanized_alert_text, :category

  attributes :amount_due,
    :due_date, :date, :created_at, :updated_at,
    :user_id, :status, :deferred_date, :address_id, :vendor, :total_alerts

  has_many :total_alerts

  def category
    object.ready_for_payment? ?  "Ready For Payment" : "Need Information"
  end

end
