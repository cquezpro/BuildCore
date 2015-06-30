class AlertsNotifier
  attr_reader :alert, :invoice

  delegate :vendor, :user, to: :invoice

  def initialize(alert, invoice)
    @alert = alert
    @invoice = invoice
  end

  def notify!
    return if settings_toggle.nil?
    alert_settings.each do |individual_settings|
      if individual_settings.send(:"#{settings_toggle}_email?")
        notify_individual_via_email individual_settings.individual
      end
      if individual_settings.send(:"#{settings_toggle}_text?")
        notify_individual_via_sms individual_settings.individual
      end
    end
  end

  private

  def notify_individual_via_email individual
    AlertsMailer.new_alert(individual.id, alert.id, invoice.id).deliver
  end

  def notify_individual_via_sms individual
    SMSAlertsComposerWorker.perform_async(individual.id, alert.id, invoice.id)
  end

  # TODO Optimize me!
  def alert_settings
    user.individuals.map do |individual|
      individual.vendor_alert_settings.for_vendor(vendor).first_or_initialize
    end
  end

  def settings_toggle
    case
    when alert.invoice_increase_total?
      :alert_total
    when alert.new_line_item?
      :alert_item
    when alert.line_item_quantity?
      :alert_itemqty
    when alert.line_item_price_increase?
      :alert_itemprice
    when alert.duplicate_invoice?
      :alert_duplicate_invoice
    when alert.manual_adjustment?
      :alert_marked_through
    when alert.no_location?, alert.processing_items?
      nil # purposely skip notification
    when alert.new_vendor?, alert.resending_payment?
      nil # TODO not implemented yet (notification is welcome)
    else
      raise "Unhandled alert type: #{alert.category}"
    end
  end
end
