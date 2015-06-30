desc "Mechanical Turk Task"
namespace :mturk do
  desc "Creates survey hits"
  task :create_surve_hits => [:environment] do
    Mturk::Surveys::Hits::Creator.try_to_create_hit
  end
end
