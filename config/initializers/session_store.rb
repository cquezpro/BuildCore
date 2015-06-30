
# Be sure to restart your server when you modify this file.

Rails.application.config.session_store :cookie_store, {
  key: 'k_BillSyncV2_session' #,
  # secure: Rails.env.production? || Rails.env.staging?,
  # httponly: Rails.env.production? || Rails.env.staging?
}
