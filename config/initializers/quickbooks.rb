Quickbooks.sandbox_mode = Rails.env.development? || Rails.env.test?

if Rails.env.development? || Rails.env.test?
  QB_APP_TOKEN = "b95020b4b79c8b4afdb9c37b0cff473f80aa"
  QB_KEY = "qyprddVaeJHE6r8hnCbX4jXZLY1xeM"
  QB_SECRET = "o6JFLH7mQy4cD22eF9HpwWW1MazK4bxHwhlSCxhN"
else
  QB_APP_TOKEN = "352cfe53be584b453ebba8dbec8347ebe4a3"
  QB_KEY = "qyprdN5bnyHDvYqUke2126e62ZXFtS"
  QB_SECRET = "TgwIQpZQuj2ZxKfXQQ9f6pXm3iZosyvW3JaIU6j7"

end


$qb_oauth_consumer = OAuth::Consumer.new(QB_KEY, QB_SECRET, {
    :site                 => "https://oauth.intuit.com",
    :request_token_path   => "/oauth/v1/get_request_token",
    :authorize_url        => "https://appcenter.intuit.com/Connect/Begin",
    :access_token_path    => "/oauth/v1/get_access_token"
})
