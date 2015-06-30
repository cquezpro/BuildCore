Rails.application.routes.draw do

  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  mount_griddler('/email/incoming')

  get 'qbwc/action' => 'qbwc#_generate_wsdl'
  get 'qbwc/qwc' => 'qbwc#qwc'
  wash_out :qbwc
  root to: redirect(ENV['ROOT_REDIRECTION_URL'] || 'http://bill-sync.com')
  get '/test_user' => 'users#test_user'

  # Dummy route which should never be triggered.  ActionDispatch::Static
  # will pick this path in the middleware.  This was introduced only to generate
  # app_url method.
  get '/app' => redirect('/app.html'), as: 'app'

  # devise_for :admins
  # mount RailsAdmin::Engine => '/admin', as: 'rails_admin'

  devise_for :individuals,
    :path => 'auth',
    :controllers => {
      omniauth_callbacks: 'api/v1/auth/omniauth_callbacks',
      sessions: 'api/v1/auth/sessions',
      confirmations: 'api/v1/auth/confirmations',
    },
    :skip_helpers => [:registrations]

  devise_scope :individual do
    post '/auth/sign_up', to: 'api/v1/auth/registrations#create'
  end

  namespace :api do
    namespace :v1, defaults: { format: :json } do
      get 'config' => 'configuration#show'
      get 'dashboard' => 'dashboard#show'

      resources :invoices do
        collection do
          get :archived_invoices, action: :archived_invoices
          put :update_all, action: :batch_update
          post :by_upload, action: :batch_create
          get :bills_count_by_status
          post :handlePdfUpload
          put :aasm_events
          get :counts
        end

        member do
          get :show, action: :show_for_turk, constraints: proc { |rq| rq.params[:hit_id].present? }
          put :defer
          post :approve
          get :invoice_transactions, action: :index_invoice_transactions
        end

        resources :uploads, only: [:index]

        resources :line_items, only: [:create, :destroy] do
          collection do
            get :search
            get :details
          end
        end

        resources :invoice_transactions, only: [:create, :destroy]
        resource :turk_transactions, only: [:create]
      end
      resources :vendors do
        collection do
          get :for_dropdown
          get :search
          get :vendors_payments
        end

        member do
          get :unique_line_items
          get :invoices
          put :merge
          put :unmerge
          get :only_parents
        end
      end
      resources :uploads, only: [:create]
      resources :invoice_moderations
      resources :users, only: [] do
        collection do
          get :authenticate
          get :oauth_callback
          get :company_info
        end
      end

      # Temporary route which shall be removed when the frontend fully switches
      # to /settings instead of requesting /users/some-id.
      get 'users/:any_id' => 'settings#show'

      resources :workers, only: [:show]
      resources :comments, only: [:create]
      resources :numbers, only: [:index,:create, :destroy, :update]
      resources :line_items do
        collection do
          put :update_all, action: :batch_update
        end
      end

      resources :line_items_reports do
        collection do
          get :by_vendor
        end
      end

      resources :sms, only: [:create] do
        post :incoming, on: :collection
      end
      resources :surveys, only: [:index, :create]
      resources :dilbert_images, only: [:index]
      resources :addresses, only: [:create, :show, :update] do
        get :invoice, on: :collection
        member do
          put :merge
          put :unmerge
        end
      end
      resources :individuals, only: [:index, :create, :update] do
        get :authorization_scopes, on: :collection
      end
      resource :settings, only: [:show, :update] do
        post :password, on: :collection, to: 'settings#update_password'
        put :disconnect, on: :collection
        put :verify_bank_information, on: :collection
      end
      resources :roles, only: [:index, :create, :destroy, :update]
    end
  end

  # constraints(:host => 'www.bill-sync.com') do
  #   get '(*x)' => redirect { |params, request|
  #     URI.parse(request.url).tap { |x| x.host = 'bill-sync.com' }.to_s
  #   }
  # end
end
