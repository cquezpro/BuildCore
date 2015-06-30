class InvoiceModerations::FirstReviewComparator
  include InvoiceModerations::Concerns::VendorComparator

  attr_accessor :im1, :im2, :invoice, :location_result

  def self.build_from(invoice)
    builder = new
    builder.invoice = invoice
    builder.im1 = invoice.invoice_moderations.submited.default[0]
    builder.im2 = invoice.invoice_moderations.submited.default[1]

    builder
  end

  def run!
    return false unless invoice && im1 && im2
    invoice.update_attribute(:processed_by_turk, true)
    clear_hit!
    update_fields_with_match

    calculate_vendor_results

    create_location_hit_if_not_match

    if fields_match? && !invoice.is_marked_through?
      update_invoice
      invoice.reload.create_line_items_hit
      return true
    end

    if !invoice.vendor_id && should_post_a_job_for_vendor?
      create_second_review_hit_for(:vendor)
      return false
    elsif !invoice.amount_due && should_post_a_job_for_amount? && invoice.amount_due_present?
      create_second_review_hit_for(:amount_due)
      return false
    else
      invoice.reload.create_line_items_hit
      update_invoice_status
    end

    false
  end

  def match_email?
    im1.email.present? && im1.email == im2.email
  end

  def same_amount?
    im1.amount_due == im2.amount_due && im1.amount_due.present? && im2.amount_due.present?
  end

  def fields_match?
    [same_amount?, vendor_match? || builder_vendor_match?].all?
  end

  def other_fields?
    InvoiceModeration::FIELDS.each do |field|
      return false unless im1[field] == im2[field]
    end
    true
  end

  def should_post_a_job_for_amount?
    !same_amount?
  end

  private

  def update_fields_with_match
    attrs = {}
    InvoiceModeration::FIELDS.each do |field|
      next if field == :vendor_id
      next if field == :amount_due && invoice.is_marked_through?
      if im1[field] == im2[field] && [im1[field], im2[field]].all?(&:present?)
        attrs[field] = im1[field] unless invoice[field].present?
      end
    end
    invoice.update_attributes(attrs)
  end

  def create_second_review_hit_for(input_name)
    unless invoice.hits.second_review.present?
      Hits::SecondHitCreator.create(invoice: invoice)
      update_third_invoice_m if input_name == :vendor
    end
  end

  def update_third_invoice_m
    new_im = invoice.invoice_moderations.second_review.first
    if new_im
      Vendor::VENDOR_BUILDER_ATTRIBUTES.each do |field|
        new_im[field] = @vendor[field]
      end
      new_im.save(validate: false)
    end
  end

  def update_invoice
    updater = Invoice::AsFirstReview.find(invoice.id)
    updater.selected_invoice_moderation = im1
    updater.set_fields_from_invoice_moderation
    updater.save
    update_invoice_status
  end

  def update_invoice_status
    invoice.reload
    calculate_score
    if invoice.is_a_valid_invoice?
      unless invoice.hits_active?('first_review')
        return if invoice.ready_for_payment? || invoice.payment_queue?
        invoice.info_complete!
      end
    else
      invoice.need_information! unless invoice.need_information?
    end
  end

  def clear_hit!
    Hits::Review.complete!(im1.hit_id)
  end

  def is_a_marked_through_invoice?
    [im1,im2].any?(&:marked?)
  end

  def create_marked_invoice_hit
    unless invoice.hits.marked_through.present?
      Hits::MarkedThroughCreator.create({invoice: invoice})
    end
  end

  def create_location_hit_if_not_match
    return unless invoice.user_locations_feature
    return unless invoice.vendor && invoice.vendor.valid_vendor?
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
        responses: invoice.invoice_moderations.default, comparation_attributes: [InvoiceModeration::FIELDS, Vendor::VENDOR_BUILDER_ATTRIBUTES].flatten,
        should_save_worker_calculation: true
      }
    ).save
    [im1, im2].compact.map {|e| e.worker.save }
  end

end
