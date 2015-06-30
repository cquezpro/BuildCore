desc "Mechanical Turk Task"
namespace :mturk do
  task :extend_expired => [:environment] do
    hits = RTurk::Hit.all_reviewable
    total = 0
    puts "> Hits reviewable: #{hits.count}"
    hits.each do |hit|
      if hit.assignments.count == hit.details.max_assignments
        hit.extend!({assignments: 1, seconds: 10.days})
        total += 1
      end
    end
    puts "> Extended hits: #{total}"
  end
end
