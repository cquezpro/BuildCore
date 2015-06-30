class Mturk::Surveys::Comparator
  attr_reader :surveys, :invoice, :location_result
  attr_accessor :matchs, :missmatchs

  def initialize(invoice)
    @invoice = invoice
    @surveys = invoice.surveys
    @missmatchs = []
    @matchs = {}
  end

  def run!
    return false unless surveys.size > 1
    comparate_fields

    invoice.update_attributes(matchs) if matchs.any?

    if invoice.is_invoice?
      invoice.create_hit unless invoice.hits.first_review.present?
      create_marked_through_hit if invoice.is_marked_through? && !invoice.hits.marked_through.present?
      update_location_if_match
      begin
        invoice.extract_data!
      rescue
      end
    else
      begin
        invoice.missing_fields!
      rescue
      end
    end

    if invoice.surveys.count >= 3 || missmatchs.blank?
      update_invoice_agreement
      calculate_score
    end
    try_to_clear_hit if invoice.survey_hit.can_clear_hit?
  end

  def comparate_fields
    Survey::COMPARATION_FIELDS.each do |field|
      fields = surveys.collect {|survey| survey.send(field) }
      matcher = MatcherService.new(fields)
      if matcher.match?
        matchs[field] = matcher.result
      else
        missmatchs << field
      end
    end

    invoice.pdf_total_pages.times do |i|
      next if invoice.can_create_hit_for_page?(i + 1)
      next if invoice.invoice_pages_result_for(i + 1).size > 2
      missmatchs << "page_#{i + 1}".to_sym
    end

    matchs
  end

  def update_location_if_match
    return unless invoice.user_locations_feature
    Alerts::AlertCreator.create(alertable: invoice, category: :no_location) if location_result == Address::INVALID_ID
    return unless locations_match? && location_result != Address::INVALID_ID
    invoice.update_attributes({address_id: location_result})
  end

  def locations_match?
    locations = surveys.collect(&:address_reference)
    matcher = MatcherService.new(locations)
    @location_result = matcher.match? ? matcher.result : nil
  end

  def create_marked_through_hit
    ::Hits::MarkedThroughCreator.create({invoice: invoice})
  end

  def update_invoice_agreement
    invoice.update_attributes(survey_agreement: true)
  end

  def try_to_clear_hit
    ::Hits::Review.complete!(invoice.survey_hit.id)
  end

  def calculate_score
    Mturk::ResponsesComparator.new(
      {
        responses: surveys, comparation_attributes: Survey::COMPARATION_FIELDS,
        should_save_worker_calculation: true
      }
    )
  end
end
