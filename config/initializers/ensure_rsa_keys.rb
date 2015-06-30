if Rails.env.test? || Rails.env.development?
  ENV["RSA_KEYPAIR"] ||= File.read(Rails.root.join "config", "development_pub.pem")
end

Figaro.require_keys "RSA_KEYPAIR"
