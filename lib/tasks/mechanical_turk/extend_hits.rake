desc "Mechanical Turk Task"
namespace :mturk do
  desc "Extend expired HITs"
  task :extend_hits => [:environment] do
    hits = RTurk::Hit.all
    hits.each do |hit|
      if not Hit.find_by(mt_hit_id: hit.id).try(:invoice)
        begin
          hit.expire!
          hit.dispose!
          next
        rescue RTurk::InvalidRequest

        end
      elsif hit.max_assignments != hit.completed_assignments && hit.expires_at < Time.now.utc
        hit.extend!({seconds: 2.hours})
      end
    end
  end
end
