desc "This task generates a file for ach verifications purposes and sends an email"
task :generate_and_send_ach_file => :environment do
  today = Date.today
  unless today.saturday? || today.sunday?
    users = User.where.not(routing_number: nil, bank_account_number: nil, encrypted_routing_number: nil, encrypted_bank_account_number: nil).where(verification_status: 0, ach_date: nil)
    ach = users.present? ? AchOutput.new(users).run! : nil
    puts "><"
    puts ach.report if ach
    PaymentsMailer.ach_file(users, ach).deliver
  end
end
