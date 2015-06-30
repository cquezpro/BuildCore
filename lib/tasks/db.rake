namespace :db do

  desc "Restore from backup made with pg_dump or Heroku pgbackup, destroys previous content"
  task :restore, [:filename] => [:drop, :create] do |t, args|
    host, database, user = host_database_user
    filename = args[:filename]

    command = %w[pg_restore --verbose --clean --no-acl --no-owner]
    command << "-h" << host if host.present?
    command << "-U" << user if user.present?
    command << "-d" << database if database.present?
    command << filename

    sh *command do |ok, res|
      puts %Q[Was loading content of "#{filename}" into "#{database}".]
    end
  end

  desc "Dump database content with pg_dump, may be used for db:restore or Heroku pgbackup import"
  task :dump, [:filename] => [:load_config] do |t, args|
    host, database, user = host_database_user
    filename = args[:filename]

    command = %w[pg_dump -Fc --no-acl --no-owner]
    command << "-h" << host if host.present?
    command << "-U" << user if user.present?
    command << database

    system *command, :out => [filename, "w"]
    puts %Q[Was dumping content of "#{database}" into "#{filename}".]
  end

  def host_database_user
    connection_conf = ActiveRecord::Base.configurations[Rails.env]
    connection_conf.values_at("host", "database", "user")
  end

end
