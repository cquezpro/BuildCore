namespace :mturk do
  desc "Send status of responses to workers"
  task :pay_daily_bonus => [:environment] do

    Worker.where(worker_level: [3, 4]).joins(:assignments).where("assignments.created_at >= ?", Date.today.at_beginning_of_day).uniq.find_each do |worker|
      worker.pay_daily_bonus!
    end

  end
end
