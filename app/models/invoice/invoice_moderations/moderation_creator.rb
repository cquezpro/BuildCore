# Create an Invoice Moderation Model for both review types.
class InvoiceModerations::ModerationCreator < InvoiceModeration

  validates :hit_id, presence: true

  def self.create_two!(invoice, hit, moderation_type = :default)

    invoice_moderation_attrs = {}
    invoice_moderation_attrs[:hit_id] = hit.id
    invoice_moderation_attrs[:moderation_type] = moderation_type
    invoice_moderation_attrs[:invoice] = invoice

    invoice_attributes.each {|attr| invoice_moderation_attrs[attr] = invoice.send(attr) }

    if vendor = invoice.vendor
      vendor_attributes.each {|attr| invoice_moderation_attrs[attr] = vendor.send(attr) }
    end

    invoice_moderations = []

    transaction do
      2.times { invoice_moderations << create(invoice_moderation_attrs) }
      invoice.update_attribute(:invoice_moderation, true)
    end

    invoice_moderations
  end

  def self.create_one!(invoice, hit, moderation_type)
    invoice_moderation_attrs = {}
    invoice_moderation_attrs[:hit_id] = hit.id
    invoice_moderation_attrs[:moderation_type] = moderation_type
    invoice_moderation_attrs[:invoice] = invoice

    invoice_attributes.each {|attr| invoice_moderation_attrs[attr] = invoice.send(attr) }
    if vendor = invoice.vendor
      vendor_attributes.each {|attr| invoice_moderation_attrs[attr] = vendor.send(attr) }
    end
    create(invoice_moderation_attrs)
  end

  private

  def self.invoice_attributes
    [ :amount_due, :tax, :other_fee, :due_date, :date, :number, :vendor_id ]
  end

  def self.vendor_attributes
    [:name, :address1, :address2, :city, :state, :zip]
  end
end

