class Api::V1::AuthorizationScopeSerializer < Api::V1::CoreSerializer
  attributes :id, :type, :name

  def type
    case object
    when Account then object.classification
    else object.class.name
    end
  end
end
