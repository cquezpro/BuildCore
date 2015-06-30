desc "Mechanical Turk Task"
namespace :mturk do
  desc "Sample invoices"
  task :create_test_invoices => [:environment] do

    def create_upload(file)
      Upload.create(image: file)
    end

    def create_invoice(upload, user)
      user.invoices.create(uploads: [upload])
    end

    user = User.where(email: 'test+2@billsync.com').first_or_initialize
    user.invoices.destroy_all
    user.password = 'asdasdasd'
    user.save

    puts " > Creating invoices"

    puts ""

    invoices_path = [Rails.root, 'lib', 'tasks', 'mechanical_turk', 'test_invoices'].join('/')

    RTurk.setup(ENV['MTURK_AWSACCESSKEYID'], ENV['MTURK_AWSSECRETACCESSKEY'], :sandbox => false)

    Dir.foreach(invoices_path) do |invoice_file_name|
      next if invoice_file_name == '.' or invoice_file_name == '..'
      file_path = [invoices_path, invoice_file_name].join('/')
      upload = create_upload(open(file_path))
      invoice = create_invoice(upload, user)
      Hits::FirstHitCreator.build_from([invoice]).save
      print "."
    end

    puts "> Done!"

    RTurk.setup(ENV['MTURK_AWSACCESSKEYID'], ENV['MTURK_AWSSECRETACCESSKEY'], :sandbox => true)
  end
end
