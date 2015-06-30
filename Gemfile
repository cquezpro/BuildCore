ruby '2.1.2'

source 'https://rubygems.org'


# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.1.1'
gem 'pg', '0.17.1'

# Upload Images
gem 'paperclip', '4.2.0'
# OOP Resources
gem 'inherited_resources', '1.6.0'
# Api Wrapper for Amazon Mechanical Turk
gem 'rturk', '2.12.1'
# S3 Config
gem 'aws-sdk', '1.52'
# Application config
gem 'figaro', '~> 1.0.0'
# Strip and trim attributes
gem 'attribute_normalizer', '1.2.0'
# ActiveRecord like PORO class behavior
gem 'active_type', '0.2.1'
# PDF Generator
gem 'prawn', '1.2.1'
gem 'pdf-inspector', :require => "pdf/inspector"
# Background JOBS
gem 'sidekiq', '~> 3.2'
# Email Parser
gem 'griddler', '1.0.0'
gem 'griddler-sendgrid', '0.0.1'
# Authentication and Authorization
gem 'devise', '3.2.4'
gem 'cancancan', '~> 1.9.2'

# Rails admin
gem 'activeadmin', github: 'activeadmin'
gem 'paper_trail', '3.0.5'
# Errbit wrapper
gem 'airbrake', '4.1.0'

# Image manipulation library
gem 'mini_magick', '4.0.0.rc'
# State machine
gem 'aasm', '3.4.0'
# New Relic
gem 'newrelic_rpm'
# Business time
gem 'business_time', '0.7.3'
# Quickbooks api wrapper
gem 'quickbooks-ruby'
# OAuth
gem 'oauth-plugin', '0.5.1'
gem 'omniauth-openid', '1.0.1'
# Twilio Api Wrapper
gem 'twilio-ruby', '3.13.1'
gem 'sidekiq-middleware'

# Determining file types
gem 'mimemagic', '0.2.1'

# Calling other programs
gem 'subexec', '0.2.3'
# WebServer
gem 'thin', '1.6.2'
# Event messages API
gem 'intercom', '~> 2.4.2'
# Dump DB to seed file
gem 'seed_dump'
# Timezone
gem 'tzinfo'
# Scheduled jobs
gem 'clockwork'
gem 'fuzzy_match'

# QB WEb connector
gem 'qbwc', github: 'dan1d/qbwc'

#scrutinizer code coverage
gem 'scrutinizer-ocular'

# ACh payment file
gem "ach"
# Dictionary of english words
gem 'ruby-dictionary'
# Helps with resource scopes
gem 'has_scope'

# More recent 0.9 exists, but: a) upcoming 0.10 will be based on 0.8
# b) 0.8 is most widely used.
gem 'active_model_serializers', '~> 0.8.3'
gem 'active_model_serializers-namespaces', github: 'skalee/active_model_serializers-namespaces'
# Pagination
gem 'kaminari'
# keep track of counters
gem 'counter_culture', '~> 0.1.23'

group :development, :staging do
  gem 'bullet'
end

group :development do
  # gem 'ruby-growl'
end

group :development, :test do
  gem 'byebug', '2.7.0'
  # gem 'pry'
  # gem 'pry-rails'
  # gem 'pry-doc'
  gem 'rspec-rails', '~> 3.1'
  gem 'json_spec'
  gem 'factory_girl_rails', '~> 4.0'
  gem 'vcr', '~> 2.9'
  # For Sidekiq monitoring
  gem 'sinatra', '1.4.5', require: false
end

group :test do
  gem 'shoulda-matchers', require: false
  gem 'database_cleaner'
  gem 'webmock', '~> 1.20'
end

group :production, :staging do
  gem 'rails_12factor', '0.0.2'
end


gem 'therubyracer', '~>0.12.1'
gem 'libv8', '~> 3.16.14.7'

# CRSF tokens for Angular/Rails
gem 'angular_rails_csrf', '1.0.1'

# Assets
# Use SCSS for stylesheets
gem 'sass-rails', '4.0.2'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '2.1.1'
# Use CoffeeScript for .js.coffee assets and views
gem 'coffee-rails', '4.0.1'
# Use jquery as the JavaScript library
gem 'jquery-rails', '3.0.4'

# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '1.2.0'


group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'sdoc', require: false
end

group :staging do
  gem 'shog'
end
