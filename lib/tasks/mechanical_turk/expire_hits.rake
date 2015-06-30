desc "Mechanical Turk Task"
namespace :mturk do
  desc "Expire all HITs"
  task :expire_all => [:environment] do

    hits = RTurk::Hit.all

    puts "#{hits.size} reviewable hits. \n"

    unless hits.empty?
      puts "Approving all assignments and disposing of each hit!"

      hits.each do |hit|
        hit.assignments.each do |assignment|
          begin
            assignment.approve!
          rescue
          end
        end

        if !['Unassignable', 'Assignable'].include? hit.status
          hit.set_as_reviewing!
          hit.expire!
        elsif hit.status == 'Assignable'
          hit.expire!
        end
        begin
          hit.dispose!
        rescue RTurk::InvalidRequest => e
          hit.disable!
          puts "> invalid #{e}"
        end
      end
    end

  end
end
