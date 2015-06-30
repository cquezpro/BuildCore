namespace :mturk do
  desc "Clear hits from production without associated invoice"
  task :clear_emtpy_hits => [:environment] do
    Hit.where(invoice_id: nil).where.not(hit_type: 4).each do |hit|
      hit.destroy
    end

  end
end
