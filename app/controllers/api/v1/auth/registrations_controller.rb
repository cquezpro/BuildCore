class Api::V1::Auth::RegistrationsController < Devise::RegistrationsController
  include ::Concerns::DeviseRedirectionPaths

  def build_resource sign_up_params
    self.resource = Registration.new sign_up_params
  end

end
