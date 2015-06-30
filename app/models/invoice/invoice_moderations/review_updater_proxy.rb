class InvoiceModerations::ReviewUpdaterProxy
  def self.find(id)
    invoice_moderation = InvoiceModeration.find(id)
    if invoice_moderation.default?
      InvoiceModerations::UpdaterFirstReview.find(id)
    elsif invoice_moderation.for_second_review?
      InvoiceModerations::UpdaterSecondReview.find(id)
    elsif invoice_moderation.for_marked_through?
      InvoiceModerations::UpdaterMarkedThrough.find(id)
    end
  end
end
