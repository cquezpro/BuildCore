class Api::V1::VendorDefaultSerializer < Api::V1::CoreSerializer
  TOGGLES = VendorAlertSettings::TOGGLES.map(&:to_sym)

  attributes :id

  attributes :user_id, :default_class, :name, :address1, :address2, :address3,
             :city, :state, :zip, :country, :fax_number, :cell_number, :email,
             :parent_id, :created_at, :updated_at, :qb_id, :sync_token, :qb_account_number,
             :liability_account, :expense_account, :settings

  delegate *TOGGLES, :to => :individual_alert_settings

  def settings
    return {} unless include_config?
    hash = {}
    TOGGLES.each do |toggle|
      hash[toggle] = send(toggle)
    end
    hash
  end

  def individual_alert_settings
    object.alert_settings.where(individual: current_individual).first_or_initialize
  end

  def expense_account
    object.expense_account || object.user.expense_account
  end

  def expense_account_id
    object.expense_account.try(:id) || object.user.expense_account.try(:id)
  end

  def liability_account
    object.liability_account || object.user.liability_account
  end

  def liability_account_id
    object.liability_account.try(:id) || object.user.liability_account.try(:id)
  end

  def include_config?
    @options[:include_config]
  end

end
