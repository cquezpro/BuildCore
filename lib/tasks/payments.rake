desc "This task generates a csv for payments purposes and sends an email"
task :generate_and_send_payments => :environment do
  if [Date.today.monday?, Date.today.thursday?].any?
    PaymentsCSV.create_and_send!
  end
end
