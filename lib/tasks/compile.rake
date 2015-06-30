desc "Compile angularjs assets and move it to public folder"
namespace :app do
  task :compile => :environment do
    system 'grunt bump'
    system 'grunt --compile'
    base_path = Rails.root
    public_path = base_path + 'public/'
    system "rm -r #{public_path}assets"
    system "rm #{public_path}app.html"

    system "mv #{base_path}/bin/assets #{public_path}"
    system "mv #{base_path}/bin/index.html #{public_path}"
    system "mv #{public_path}index.html #{public_path}app.html"
  end
end
