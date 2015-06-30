desc "Remove duplicate items"
task :remove_duplicate_items => [:environment] do

  Vendor.find_each do |vendor|
    vendor.line_items.select("DISTINCT(description) description, vendor_id, id").each do |item|
      byebug
      LineItem.where(description: item.description, vendor_id: item.vendor_id).where.not(id: item.id).each do |li|
        item.invoice_transactions << li.invoice_transactions
        li.destroy
      end
    end
  end

end
