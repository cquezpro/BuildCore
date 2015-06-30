namespace :mturk do
  desc "Grant qualifications to workers with score > 50"
  task :grant_qualifications => [:environment] do
    puts "> Starting qualification"

    qualification_id = '3UQ590QUS87HL0VRV47UYOZ031CDFF'
    puts "> Fetching workers"
    puts ""
    count = 0
    Worker.where('score >= ?', Worker::APPROVAL_LEVEL).unblocked.where(grant_time: nil).each do |worker|
      print "."
      worker.grant_qualification(qualification_id)
      count += 1
    end
    puts "> Total workers granted: #{count}"
    puts "> Done!"
  end
end
