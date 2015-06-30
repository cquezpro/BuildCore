desc "Compile angularjs assets and move it to public folder"
namespace :test_task do
  task :save => :environment do
    User.limit(5).each do |user|
      user.invoices.collect(&:save)
    end
  end
end
