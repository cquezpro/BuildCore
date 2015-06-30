class Api::V1::CurrentIndividualSerializer < Api::V1::IndividualSerializer
  TOGGLES = CommonAlertSettings::TOGGLES.map(&:to_sym)

  attribute :permissions

  attributes *TOGGLES

  has_one :user, serializer: UserSerializer

  delegate *TOGGLES, :to => :common_alert_settings
  delegate :common_alert_settings, :to => :object
end
