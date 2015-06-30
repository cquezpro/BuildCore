class InvoiceTransactions::AsBuilder < ActiveType::Record[InvoiceTransaction]

  attribute :description, :string
  attribute :code, :string

  validates :description, :total, presence: true
  before_validation :associate_or_create_item, unless: :line_item

  def self.bulk_builder(params, invoice_id)
    invoice = Invoice.find(invoice_id)
    items = []
    params.each do |hash|
      if hash[:id] && item = InvoiceTransactions::AsBuilder.find(hash[:id])
        r = item.update_attributes(hash.merge(invoice: invoice))
        a = item.errors.inspect
        items << r
      else
        r = create(hash.merge(invoice: invoice))
        a = r.errors.inspect
        items << r
      end
    end
    items
  end

  private

  def associate_or_create_item
    return unless invoice && vendor = invoice.vendor
    if item = vendor.line_items.where(description: description).first
      self.line_item = item
      return true
    elsif description.present?
      self.line_item = LineItem.create(description: description, code: code, vendor_id: vendor.id)
      return true
    end
    false
  end
end
