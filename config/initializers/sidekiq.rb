if Rails.env.production? || Rails.env.staging? || Rails.env.scotty_scrypt_production?
  Sidekiq.configure_server do |config|
    config.redis = { :url => ENV['REDIS_PROVIDER'] }
  end


  Sidekiq.configure_client do |config|
    config.redis = { :url => ENV['REDIS_PROVIDER'] }
  end
end
