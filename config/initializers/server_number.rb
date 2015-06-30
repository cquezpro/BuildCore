if Rails.env.production? || Rails.env.staging? || Rails.env.development?
  Figaro.require_keys "SERVER_NUMBER"
end

SERVER_NUMBER = ENV["SERVER_NUMBER"]
