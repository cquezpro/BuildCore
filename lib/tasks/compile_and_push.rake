desc "Compile angularjs assets and commit and push to heroku"
namespace :app do
	task :compile_and_push => :environment do
	  Rake::Task['app:compile'].invoke
	  system "git add ."
	  system "git commit -m 'Compiled Angular app to deploy'"
	  system "git push heroku master"
 	end
end
