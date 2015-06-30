class Api::V1::IndividualsController < Api::V1::CoreController

  skip_load_and_authorize_resource only: [:update_password, :authorization_scopes]

  before_action :process_authorization_scopes, only: [:create, :update]

  def create
    resource.randomize_password
    super
  end

  def authorization_scopes
    authorize! :read, Individual
    collection = current_user.expense_accounts + current_user.vendors + current_user.qb_classes
    respond_with collection, each_serializer: Api::V1::AuthorizationScopeSerializer
  end

  private

  def process_authorization_scopes
    return unless params[:individual]
    return unless params.has_key?(:authorization_scopes) || params[:individual].has_key?(:authorization_scopes)

    src = (params[:individual].delete(:authorization_scopes) || params[:authorization_scopes]) or []
    src = src ? src : []

    expense_account_ids = params[:individual][:permitted_expense_account_ids] = []
    qb_classes_ids = params[:individual][:permitted_qb_class_ids] = []
    vendor_ids = params[:individual][:permitted_vendor_ids] = []

    src.each do |scope_hash|
      case scope_hash[:type]
      when "Expense" then expense_account_ids << scope_hash[:id]
      when "Vendor" then vendor_ids << scope_hash[:id]
      when "QBClass" then qb_classes_ids << scope_hash[:id]
      end
    end
  end

  def permitted_params
    params.permit(individual: [
      :name, :email, :role_id, :limit_min, :limit_max,:mobile_phone, :inviter_name,
      :permitted_expense_account_ids => [], :permitted_qb_class_ids => [],
      :permitted_vendor_ids => []]
    )
  end

  def end_of_association_chain
    current_user.individuals
  end

end
