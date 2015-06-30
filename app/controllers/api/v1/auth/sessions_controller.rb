class Api::V1::Auth::SessionsController < Devise::SessionsController
  include ::Concerns::DeviseRedirectionPaths

  # Copied from original Devise.  Overriding and using super keyword is not
  # enough as it does not allow response customization.
  def create
    self.resource = warden.authenticate!(auth_options)
    set_flash_message(:notice, :signed_in) if is_flashing_format?
    sign_in(resource_name, resource)
    yield resource if block_given?
    respond_with resource, location: after_sign_in_path_for(resource), serializer: Api::V1::CurrentIndividualSerializer, root: false
  end
end
