class MatcherService
  attr_accessor :fields, :include_nil

  def initialize(fields)
    @fields = fields
  end

  def get_match
    set = Set.new
    @dupe = []
    fields.each do |field|
      if set.include?(field)
        @dupe << field
      else
        set << field
      end
    end
    @dupe
  end

  def match?
    get_match.present?
  end

  def result
    @dupe.try(:first)
  end

end
