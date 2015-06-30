class Api::V1::UsersController < Api::V1::CoreController
  before_filter :authenticate_individual!, except: [:authenticate, :oauth_callback, :company_info]
  before_action :set_resource, only: [:update]
  # allow_everyone only: [:company_info]
  skip_authorization_check only: [:show, :company_info]
  skip_load_and_authorize_resource only: [:show, :company_info]

  def authenticate
    callback = oauth_callback_api_v1_users_url
    token = $qb_oauth_consumer.get_request_token(:oauth_callback => callback)
    session[:qb_request_token] = Marshal.dump(token)
    redirect_to("https://appcenter.intuit.com/Connect/Begin?oauth_token=#{token.token}") and return
  end

  def oauth_callback
    at = Marshal.load(session[:qb_request_token]).get_access_token(:oauth_verifier => params[:oauth_verifier])
    oauth_client = OAuth::AccessToken.new($qb_oauth_consumer, at.token, at.secret)
    company_service = Quickbooks::Service::CompanyInfo.new
    company_service.access_token = oauth_client
    company_service.company_id = params['realmId']
    response = company_service.query
    response = response.first
    email = response[:email][:address]
    user = current_user ? current_user : User.find_or_initialize_by(email: email)
    user.password = 'change-me-asssaappppp' if user.new_record?
    user.qb_token = at.token
    user.qb_secret = at.secret
    user.realm_id = params['realmId']
    user.save
    user.sync_qb_accounts
    sign_in user, :event => :authentication unless current_user

    respond_to do |format|
      format.html { render 'api/v1/users/oauth_callback' }
      format.json do              # render an html page instead of a JSON response
        render 'api/v1/users/oauth_callback.html', {
          :content_type => 'text/html',
          :layout       => 'application'
        }
      end
    end
  end

  def company_info
    begin
      user = Hit.find_by(mt_hit_id: params[:hit_id]).invoice.user
      addresses = user.addresses.collect {|e| {name: e.name.try(:downcase), address1: e.address1.try(:downcase) } }
      user_company = { name: user.business_name.try(:downcase), address1: user.billing_address1.try(:downcase), user_mark: true }
      user_doing_business_as = { name: user.doing_business_as.try(:downcase), address1: nil, user_mark: true }
      render json: [user_company, user_doing_business_as, addresses ].flatten
    rescue => e
      puts e.message
      head 404
    end
  end

  private

  def permitted_params
    params.permit(user: user_params)
  end

  def user_params
    [
      :id, :invite_code, :name, :mobile_phone, :business_name, :email,
      :billing_address1, :billing_address2, :billing_city, :billing_state,
      :billing_zip, :business_type, :routing_number, :bank_account_number,
      :mobile_number, :check_number, :expense_account_id, :liability_account_id,
      :bank_account_id, :terms_of_service, :sms_time, :pay_bills_through_text,
      :locations_feature, :modal_used, :default_class_id, :default_due_date,
      :timezone, :alert_marked_through, :file_password,
      :emails_attributes => [:id, :string]
    ]
 end

 def set_resource
   @user = current_user
 end
end
