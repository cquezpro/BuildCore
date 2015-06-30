class Mturk::ResponsesComparator < ActiveType::Object
  attr_accessor :should_save_worker_calculation

  attribute :workers, :array
  attribute :responses, :array # [array of AR records]
  attribute :comparation_attributes, :array # [ array of attributes to compare]

  before_save :set_workers
  before_save :compare_results_and_recalculate_score
  before_save :save_worker_calculations, if: :should_save_worker_calculation

  private

  def compare_results_and_recalculate_score
    compare_results and recalculate_score
  end

  def compare_results
    @comparation_results = Hash.new { |hash, key| hash[key] = [] }
    responses.each do |v|
      comparation_attributes.each do |attr|
        @comparation_results[attr] << { attribute: v.send(attr), worker: v.worker, model: v }
      end
    end
  end

  def recalculate_score
    @comparation_results.each_pair do |k,responses|
      check_matches(responses, k)
    end
  end

  def check_matches(responses, attribute_name)
    responses.each do |response|
      attribute_responses = responses.collect {|e| e[:attribute] }
      fuzzy_match_items = attribute_responses.dup
      model = response[:model]
      fuzzy_match_items.delete_at(fuzzy_match_items.index(response[:attribute]))
      fz = FuzzyMatch.new(fuzzy_match_items, find_with_score: true)
      found_item = fz.find(response[:attribute])
      # if !found_item && !response[:attribute].nil?
      #   byebug
      # end
      if !found_item.present? && attribute_responses.count == 3 && attribute_responses.count(response[:attribute]) == 1 && attribute_responses.uniq.count == 2 && !response[:attribute].nil?
        create_response(model, attribute_name, :rejected, response[:attribute], attribute_responses.uniq.find {|e| e != response[:attribute]})
        response[:worker].punish
        return
      end
      return unless found_item

      if found_item && found_item.second < 0.85 || found_item.second < 0.85
        create_response(model, attribute_name, :rejected, response[:attribute], attribute_responses.uniq.find {|e| e != response[:attribute]})
        response[:worker].punish
      elsif found_item && found_item.second > 0.85 || found_item.second > 0.85 # if match is found add score
        create_response(model, attribute_name, :accepted, response[:attribute])
        response[:worker].add_score
      end
    end
  end

  def set_workers
    return true if workers
    self.workers = responses.collect {|e| e.worker }.uniq
    true
  end

  def save_worker_calculations
    workers.each {|e| e.save(validate: false) }
  end

  def create_response(model, attribute_name, status, field_response, expected = nil)
    model.responses.create(field_name: attribute_name, status: status,
      worker: model.worker, assignment: model.assignment,
      expected_response: expected,
      field_response: field_response)
  end

end
