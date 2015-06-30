namespace :mturk do
  desc "Send status of responses to workers"
  task :send_status_responses => [:environment] do

    Worker.where(notifications_disabled: false).joins(:responses).where("responses.created_at >= ? AND responses.status = 0", Date.today.at_beginning_of_day).uniq.find_each do |worker|
      worker.send_daily_digest!
    end
  end
end
