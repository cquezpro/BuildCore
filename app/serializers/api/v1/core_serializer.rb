class Api::V1::CoreSerializer < ActiveModel::Serializer

  delegate :can?, :cannot?, :to => :current_ability, :allow_nil => true

  alias_method :current_ability, :scope

  protected

  def current_individual
    current_ability.try(:individual)
  end
end
