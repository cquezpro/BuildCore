class InvoiceModerations::SecondReviewComparator
  include InvoiceModerations::Concerns::VendorComparator

  attr_accessor :im1, :im2, :new_im, :invoice, :location_result

  def self.build_from(invoice)
    builder = new
    builder.invoice = invoice
    builder.im1 = invoice.invoice_moderations.default[0]
    builder.im2 = invoice.invoice_moderations.default[1]
    builder.new_im = invoice.invoice_moderations.second_review[0]

    builder
  end

  def run!
    @im3 = @new_im
    find_match_for(:amount_due) unless invoice.amount_due
    find_vendor_match unless invoice.vendor
    update_invoice_status
    clear_hit!
  end

  private

  def find_match_for(field_name)
    object = [{update: im1, punish: im2},{update: im2, punish: im1}]
    object.each do |hash|
      if field_present?(hash[:update], field_name)
        update_invoice_from(hash[:update], field_name)
        invoice.reload.info_complete!
        return true
      end
    end
    invoice.missing_fields!
    false
  end

  def find_vendor_match
    calculate_vendor_results
    create_location_hit_if_not_match
  end

  def update_invoice_status
    invoice.reload
    calculate_score
    if invoice.is_a_valid_invoice?
      invoice.create_line_items_hit
      unless invoice.hits_active?('second_review')
        return if invoice.ready_for_payment? || invoice.payment_queue?
        invoice.info_complete!
        return true
      end
      false
    else
      invoice.missing_fields! unless invoice.need_information?
      false
    end
  end

  def valid_vendor?
    @vendor.valid_vendor?
  end

  def field_present?(invoice_moderation, field_name)
    new_im.send(field_name) == invoice_moderation.send(field_name) && invoice_moderation.send(field_name).present?
  end

  def update_invoice_from(invoice_moderation, field_name)
    Invoice::AsSecondReview.update_with(invoice_moderation, field_name)
  end

  def clear_hit!
    Hits::Review.complete!(new_im.hit_id)
  end

  def update_ims_vendor_id
    [im1,im2, new_im].each do |im|
      im.update_column(:vendor_id, @vendor.id)
    end
  end

  def create_location_hit_if_not_match
    return unless invoice.user_locations_feature
    return unless invoice.vendor.valid_vendor?
    return if location_result == Address::INVALID_ID
    if locations_match? && location_result != Address::INVALID_ID
      invoice.update_attributes({address_id: location_result})
    else
      create_location_hit
    end
  end

  def create_location_hit
    ::Mturk::Addresses::Hits::Creator.create(invoice: invoice, hit_type: :for_address)
  end

  def locations_match?
    locations = invoice.surveys.collect(&:address_reference)
    matcher = MatcherService.new(locations)
    @location_result = matcher.match? ? matcher.result : nil
  end

  def calculate_score
    Mturk::ResponsesComparator.new(
      {
        responses: invoice.invoice_moderations.for_second_review, comparation_attributes: [InvoiceModeration::FIELDS, Vendor::VENDOR_BUILDER_ATTRIBUTES].flatten,
        should_save_worker_calculation: true
      }
    ).save
    [im1, im2, im3].compact.map {|e| e.worker.try(:save) }
  end
end
