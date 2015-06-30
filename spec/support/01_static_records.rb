# It is critical not to perform it before DatabaseCleaner truncates tables.

require "rake"

RSpec.configure do |config|

  config.before(:suite) do
    Rake::Task["static_records:all"] rescue Rails.application.load_tasks
    Rake::Task["static_records:all"].invoke
  end

end
