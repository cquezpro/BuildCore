namespace :monitor do

  desc "Run Sidekiq monitoring & management application on port 9494"
  task :sidekiq do
    # optional: Process.daemon (and take care of Process.pid to kill process later on)
    require 'sidekiq/web'
    app = Sidekiq::Web
    app.set :environment, :production
    app.set :bind, '0.0.0.0'
    app.set :port, 9494
    app.run!
  end

end
