class Mturk::Addresses::Comparator
  attr_reader :invoice, :addresses, :missmatchs, :matchs, :address

  def initialize(invoice)
    @invoice = invoice
    @addresses = invoice.addresses.by_worker
    @matchs = {}
    @missmatchs = []
  end

  def run!
    return false unless invoice && addresses.present?
    compare_fields
    build_address

    if missmatchs.blank? && address.valid_address?
      clear_hit!
      address.update_attributes(created_by: :by_user)
      address.save if address.new_record?
      invoice.update_attributes(address_id: address.id)
    else
      if addresses.count >= 3
        clear_hit!
        address.update_attributes(created_by: :by_user)
        address.save if address.new_record?
        invoice.update_attributes(address_id: address.id)
        Alerts::AlertCreator.create(alertable: invoice, category: :no_location, invoice_owner: invoice) unless address.valid_address?
      else
        address.destroy
        extend_hit!
      end

    end
  end

  def compare_fields
    Address::COMPARATION_FIELDS.each do |field|
      fields = addresses.collect {|address| address.send(field) }
      matcher = MatcherService.new(fields)
      if matcher.match?
        matchs[field] = matcher.result
      else
        missmatchs << field
      end
    end
    matchs
  end

  def build_address
    matchs[:created_by] = 0
    matchs[:user] = invoice.user
    @address = invoice.user.addresses.find_or_initialize_by(matchs)
  end

  def clear_hit!
    ::Hits::Review.complete!(invoice.hits.for_address.first.id)
  end

  def extend_hit!
    ::Hits::Review.extend_hit!(invoice.hits.for_address.first.id)
  end

end
