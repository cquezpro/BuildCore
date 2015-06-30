namespace :intercom do
  namespace :update do

    desc "Send all available data to Intercom"
    task :all => [:companies, :individuals]

    desc "Send all companies data to Intercom"
    task :companies => :prepare do
      puts "Sending companies to Intercom"
      update_relation User.all
    end

    desc "Send all individuals data to Intercom"
    task :individuals => :prepare do
      puts "Sending individuals to Intercom"
      update_relation Individual.all
    end

    task :prepare => :environment

    def update_relation relation
      relation.find_in_batches(batch_size: 10).inject(0) do |counter, group|
        group.each { |object| IntercomUpdater.update object }
        new_counter = counter + group.size
        puts "Updated #{new_counter} records"
        new_counter
      end
    end

  end
end
