class Api::V1::InvoiceHomeSerializer < Api::V1::CoreSerializer
  attributes :id

  # Schema attributes
  attributes :number, :vendor_id, :amount_due, :tax, :other_fee,
      :due_date, :resale_number, :account_number, :date,
      :created_at, :updated_at, :user_id,
      :payment_send_date, :payment_date, :act_by, :email_body, :paid_with,
      :status, :source, :check_number, :check_date,
      :source_email, :deferred_date,
      :stated_date, :vendor, :total_alerts_count

  # has_many :total_alerts

  def vendor
    Api::V1::VendorDefaultSerializer.new(object.vendor, {
      root: false,
      scope: current_ability,
      serialization_namespace: Api::V1,
    })
  end

  def total_alerts_count
    return unless object.vendor
    count = alerts_query.count
    "#{count} alert".pluralize(count)
  end

  def alerts
    return unless object.vendor
    alerts_query
  end

  def alerts_query
    return @alerts_query if @alerts_query
    settings = {
      alert_total_flag: 0,
      alert_item_flag: 1,
      alert_itemqty_flag: 2,
      alert_itemprice_flag: 3,
      alert_duplicate_invoice_flag: 5,
      alert_marked_through_flag: 6
    }
    alert_setting = object.vendor.alert_settings.where(individual: current_individual).first_or_initialize
    categories = []
    settings.keys.each do |key|
      categories << settings[key] if alert_setting.send(key)
    end
    @alerts_query = object.total_alerts.where(category: categories)
  end

end
