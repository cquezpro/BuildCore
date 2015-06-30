class Api::V1::IndividualSerializer < Api::V1::CoreSerializer
  attributes :id, :email, :name, :role_id, :limit_min, :limit_max, :selected_scopes_ids

  has_many :permission_scopes, key: :authorization_scopes, serializer: Api::V1::AuthorizationScopeSerializer
  has_one :number

  def selected_scopes_ids
    object.permission_scopes.collect {|e| "#{e.class}-#{e.id}"}
  end
end
