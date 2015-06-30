# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

User.destroy_all
Vendor.destroy_all
Invoice.destroy_all
InvoiceModeration.destroy_all
Hit.destroy_all
Assignment.destroy_all
Worker.destroy_all
AdminUser.destroy_all
Alert.destroy_all
Role.destroy_all
Individual.destroy_all

users = []
vendors = []
invoices = []

valid_routing_number = "011000015" # FED
builder_skip_confirmation = proc { |builder| builder.individual.skip_confirmation! }

puts ">> Creating static records"

# Calling it here instead to enhancing db:seed to avoid records removal
# with ::destroy_all in the begining of this file.
Rake::Task["static_records:all"].invoke

puts ">> Creating Users"

users << user = User.create(terms_of_service: true)
individual = Individual.create(email: "asd@asd.com", password: "asdasd", user_id: user.id)

Role.stock.to_a.each do |role|
  email = role.name.downcase.gsub(/\W/, "") << "@asd.com"
  user.individuals.create(email: email, password: 'asdasd', role: role)
  puts "errors #{user.errors}" if user.errors.any?
end
# byebug

5.times do |i|
  print "."
  users << user = User.create(terms_of_service: true)
  user.update_attribute(:created_at, 2.months.ago)
  # byebug if i+1 == 1
  Individual.create(email: "asd-#{i + 1}@asd.com", user_id: user.id, password: "asdasd").confirm!
end

puts
puts "<< Users created: #{users.count}"
puts

puts ">> Creating accounts"

users.each do |user|
  accs = []
  4.times do |i|
    accs << Account.create(name: "Goods/expsense #{i}", user: user, classification: "CostOfGoodsSold", account_type: "CostOfGoodsSold")
    print "."
  end
  user.update_column(:expense_account_id, accs.first.id)

  accs = []
  4.times do |i|
    accs << Account.create(name: "AccountsPayable #{i}", user: user, classification: "AccountsPayable", account_type: "AccountsPayable")
    print "."
  end
  user.update_column(:liability_account_id, accs.first.id)

  accs = []
  4.times do |i|
    accs << Account.create(name: "Bank #{i}", user: user, classification: "AccountsPayable", account_type: "AccountsPayable")
    print "."
  end

  user.update_column(:bank_account_id, accs.first.id)

  klasses = []

  5.times do |i|
    accs << QBClass.create(name: "Klass #{i}", user: user)
  end
end

puts
puts ">> Creating Vendors"
users.each do |user|
  1.times do |i|
    print "."
    vendors << vendor = Vendor.create(name: "User Test #{i} routing number only-", routing_number: valid_routing_number,
                           bank_account_number: "123456789", user: user)
    vendor.update_attribute(:created_at, 2.months.ago)
  end
end

users.each do |user|
    print "."
    vendors << Vendor.create(name: "User Test #{rand(20)} Both-", routing_number: valid_routing_number,
                           bank_account_number: "123456789", user: user, address1: "123 Main St", address2: "Suite #{rand(20)}", state: "CA", zip: 39211)
    print "."
    vendors << Vendor.create(name: "User Test #{rand(20)} address only-", user: user, address1: "123 Main St", address2: "Suite #{rand(20)}", city: "Los Angeles", state: "CA", zip: 39211)
end

puts
puts "<< Vendors created: #{vendors.count}"
puts ">> Creating Invoices"

invoices = []

users.each do |user|
  user.vendors.each do |vendor|
    2.times do |i|
      print "."
      invoices << Invoice.create(number: rand(99999), vendor: vendor, status: 1, due_date: Date.today + 1, user: user)
      print "."
      invoices << Invoice.create(number: rand(99999), vendor: vendor, status: 2, due_date: Date.today + 2, user: user)
      print "."
      invoices << Invoice.create(number: rand(99999), vendor: vendor, status: 3, due_date: Date.today + 3, user: user)
      print "."
      invoices << Invoice.create(number: rand(99999), vendor: vendor, amount_due: "11.19", status: 4, due_date: Date.today + 4, user: user)
      print "."
      invoices << Invoice.create(number: rand(99999), vendor: vendor, amount_due: "#{i}.#{i}9", status: 5, due_date: Date.today + 5, user: user)
      print "."
      invoices << Invoice.create(number: rand(99999), vendor: vendor, amount_due: "1#{i}.#{i}9", status: 6, due_date: Date.today + 6, user: user)
      print "."
      invoices << Invoice.create(number: rand(99999), vendor: vendor, amount_due: "1#{i}.#{i}9", status: 7, due_date: Date.today + 7, user: user)
      print "."
      invoices << Invoice.create(number: rand(99999), vendor: vendor, amount_due: "1#{i}.#{i}9", status: 8, due_date: Date.today + 8, user: user)
      print "."
      invoices << Invoice.create(number: rand(99999), vendor: vendor, amount_due: "1#{i}.#{i}9", status: 9, due_date: Date.today + 9, user: user)
      print "."
      invoices << Invoice.create(number: rand(99999), vendor: vendor, amount_due: "1#{i}.#{i}9", status: 10, due_date: Date.today + 10, user: user)
      print "."
      invoices << Invoice.create(number: rand(99999), vendor: vendor, amount_due: "1#{i}.#{i}9", status: 11, due_date: Date.today + 11, user: user)
      print "."
      invoices << Invoice.create(number: rand(99999), vendor: vendor, amount_due: "1#{i}.#{i}9", status: 12, due_date: Date.today + 12, user: user)
      print "."
      invoices << Invoice.create(number: rand(99999), vendor: vendor, amount_due: "1#{i}.#{i}9", status: 13, due_date: Date.today + 13, user: user)
      print "."
      # Raise alert for amount due
      invoices << Invoice.create(number: rand(99999), vendor: vendor, amount_due: rand(6000), status: 13, due_date: Date.today + 13, user: user)
    end
  end
end

puts
puts "<< Invoices created: #{invoices.count}"
puts ">> Creating LineItems"

users.each do |user|
  user.vendors.limit(2).each do |vendor|
    14.times do |i|
      print "."
      vendor.line_items.create(quantity: rand(400), code: "code-#{rand(1)}}", description: "description: - #{rand(1)}", price: rand(400))
    end
  end
end


user = User.last

5.times do
  Invoice.create(user: user, is_invoice: true, vendor_present: true,
    address_present: true, amount_due_present: true, line_items_count: 5,
    is_marked_through: true)
end
# Survey

individual = Individual.find_or_initialize_by(email: "asd@asd.com", user: user)
if individual.new_record?
  individual.password = "asdasd"
  individual.password_confirmation = "asdasd"
  individual.save
end

user = individual.user || User.new(individuals: [individual])
user.attributes = {
  business_name: "User",
  billing_address1: "address 1",
  billing_address2: nil,
  billing_city: "city",
  billing_state: "NY",
  billing_zip: "4000"
}
user.save


user_invoices = []
5.times do
  user_invoices << Invoice.create(user: user, is_invoice: true,
    vendor_present: true, address_present: true, amount_due_present: true,
    line_items_count: true, is_marked_through: true)
end

puts ""
Hit.create(mt_hit_id: "survey", hit_type: :for_survey, invoice_surveys: user_invoices)
puts "Visit path: /surveys?assignmentId&workerId&hitId=survey for survey form"
# Default
hit = Hit.create(mt_hit_id: "first_review", hit_type: :first_review, invoice: user_invoices.last)
InvoiceModerations::ModerationCreator.create_two!(user_invoices.last, hit, :default)
puts "Visit path: /invoice/fromaws?assignmentId&workerId&hitId=first_review for extract information hit."
# Line Item
invoice = user_invoices.last
user.invoices << invoice
InvoicePage.create(invoice: invoice, line_items_count: 2, page_number: 1, line_items_count: 3)
InvoicePage.create(invoice: invoice, line_items_count: 2, page_number: 1, line_items_count: 3)
InvoicePage.create(invoice: invoice, line_items_count: 2, page_number: 2, line_items_count: 5)
InvoicePage.create(invoice: invoice, line_items_count: 2, page_number: 2, line_items_count: 5)
Hit.create(mt_hit_id: "item", hit_type: :for_line_item, invoice: invoice, page_number: 1)
Hit.create(mt_hit_id: "item2", hit_type: :for_line_item, invoice: invoice, page_number: 2)
puts "Visit path: /invoice/noId/line-items-aws?assignmentId&workerId&hitId=item for item line hit."
# Marked Throught
hit = Hit.create(mt_hit_id: "amount_due", hit_type: :marked_through, invoice: user_invoices.last)
InvoiceModerations::ModerationCreator.create_two!(user_invoices.last, hit, :for_marked_through)
puts "Visit path: /invoice/fromaws?assignmentId&workerId&hitId=amount_due Amount due."

#Daniel please check this part of the seed.

# hit = Hit.create(mt_hit_id: "vendor", hit_type: :second_review, invoice: user_invoices.last)
# InvoiceModerations::ModerationCreator.create_one!(user_invoices.last, hit, :second_review)
# puts "Visit path: /invoice/fromaws?assignmentId&workerId&hitId=vendor Vendor fields."

Hit.create(mt_hit_id: "address", hit_type: :for_address, invoice: user_invoices.last)
puts "Visit path: /address?assignmentId&workerId&hitId=address for address hit."


puts "<< Invoices created: #{invoices.count}"
puts "Example user: email: #{Individual.first.email} password: asdasd"
puts "> Creating Admin"

admin = AdminUser.create(email: 'admin@bill-sync.com', password: 'asdasd')
AdminUser.create(email: 'asd@asd.com', password: 'asdasd')

puts "< Admin Created: email: #{admin.email} password: asdasd"

puts "Done!"
