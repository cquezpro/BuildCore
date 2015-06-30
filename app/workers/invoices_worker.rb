class InvoicesWorker
  include Sidekiq::Worker

  def perform(opts = {})
  	if opts["recalculate_date"] && opts["vendor_id"] && vendor = Vendor.find(opts["vendor_id"].to_i)

  		vendor.invoices.where(status: [1,2,3,4]).each do |invoice|
  		  invoice.recalculate_due_date
  		  invoice.save
  		end
  	end
  end
end
