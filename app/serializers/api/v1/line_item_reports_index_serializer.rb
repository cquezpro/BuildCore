class Api::V1::LineItemReportsIndexSerializer < Api::V1::CoreSerializer
  attributes :records, :current_page, :per_page, :total_pages

  def records
    objects.collect {|e| Api::V1::LineItemReportsBaseSerializer.new(e, serializer_options) }
  end

  def current_page
    @options[:page]
  end

  def per_page
    @options[:per_page] || 100
  end

  def total_pages
    objects.total_count
  end

  private

  def objects
    @options[:records]
  end

  def serializer_options
    {
      root: false,
      serialization_namespace: Api::V1,
      scope: current_ability,
    }
  end

  def order_by_total
    @options[:by_total]
  end
end
