class Api::V1::CoreController < InheritedResources::Base
  include Concerns::FixInheritedResources

  before_filter :authenticate_individual!, :disable_cors
  check_authorization
  load_and_authorize_resource

  respond_to :json
  actions :all

  # protect_from_forgery

  # before_filter :set_no_cache_header
  # after_action  :set_csrf_cookie_for_ng

  rescue_from CanCan::AccessDenied, with: :access_denied

  def set_csrf_cookie_for_ng
    cookies['XSRF-TOKEN'] = form_authenticity_token if protect_against_forgery?
  end

  def default_serializer_options
    {
      root: false,
      serialization_namespace: Api::V1,
      scope: current_ability,
    }
  end

  protected

  def verified_request?
    super || form_authenticity_token == request.headers['X_XSRF_TOKEN']
  end

  def render_empty_json(status_code)
    respond_to do |format|
      format.json { render json: [], status: status_code }
    end
  end

  # def set_no_cache_header
  #   response.headers["Cache-Control"] = "no-cache, no-store, max-age=0" if devise_controller?
  # end

  def current_user
    @current_user ||= current_individual.try(:user)
  end
  helper_method :current_user

  def current_ability
    @current_ability ||= Ability.new(current_individual)
  end

  # Convenience method which skips all the authentication and authorization.
  def self.allow_everyone options = {}
    skip_before_action :authenticate_individual!, options
    skip_authorization_check options
    skip_load_and_authorize_resource options
  end

  def access_denied
    head :unauthorized
  end

  def disable_cors
    return true unless Rails.env.development?
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, PUT, DELETE, GET, OPTIONS'
    headers['Access-Control-Request-Method'] = '*'
    headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  end
end
