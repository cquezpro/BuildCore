class Api::V1::InvoiceSerializer < Api::V1::CoreSerializer
  attributes :id

  has_many :invoice_transactions
  has_many :total_alerts
  has_one :vendor, serializer: Api::V1::VendorDefaultSerializer

  # Method attributes
  attributes :uploaded_images, :pdf_url,
      :humanized_status, :comparation_humanized_status, :humanized_alert_text,
      :default_item

  # Schema attributes
  attributes :number, :vendor_id, :amount_due, :tax, :other_fee,
      :due_date, :resale_number, :account_number, :date, :invoice_total, :new_item,
      :line_item_quantity, :unit_price, :created_at, :updated_at,
      :user_id, :invoice_moderation, :reviewed,
      :payment_send_date, :payment_date, :act_by, :email_body, :paid_with,
      :status, :source, :check_number, :check_date,
      :source_email, :deferred_date,
      :stated_date, :processed_by_turk, :address_id, :vendor,
      :pdf_file_name, :pdf_content_type, :pdf_file_size, :pdf_updated_at,
      :regular_approved, :accountant_approved, :total_line_items, :unaccounted

 def unaccounted
   object.get_default_item.try(:total)
 end

end
