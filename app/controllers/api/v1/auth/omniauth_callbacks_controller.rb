class Api::V1::Auth::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  skip_before_filter :verify_authenticity_token, :only => [:intuit]

  def intuit
    user = User.find_for_open_id(request.env["omniauth.auth"], current_user, params)
    if user.persisted? && !current_user
      sign_in user, :event => :authentication
    end
    redirect_to app_url
  end
end
