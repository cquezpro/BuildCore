require 'database_cleaner'

RSpec.configure do |config|

  config.before(:suite) do
    DatabaseCleaner[:active_record].strategy = :transaction
    DatabaseCleaner[:active_record].clean_with :truncation
  end

  config.around(:example) do |example|
    DatabaseCleaner[:active_record].cleaning do
      example.run
    end
  end

end
