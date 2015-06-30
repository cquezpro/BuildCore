class QuickbooksWC::VendorWorker < QBWC::Worker

  def requests(job, uniq_business_name)
    user = User.find_by_uniq_business_name(uniq_business_name)
    vendor = user.vendors.where(sync_qb: true).where.not(name: nil).first
    vendor.to_qb_xml
  end

  def handle_response(r, job, request, data, uniq_business_name)
    begin
      xml = r["xml_attributes"]
      vendor_attrs = r["vendor_ret"]
      vendor = Vendor.includes(:invoices).find(xml["requestID"])

      if vendor.request_number > 2
        vendor.update_columns(sync_qb: false, search_on_qb: false)
      end
      vendor.update_column(:request_number, vendor.request_number += 1)

      if xml["statusCode"] == "3200"
        vendor.update_column(:edit_sequence, vendor_attrs["edit_sequence"])
        vendor.invoices.each do |invoice|
          invoice.sync_with_quickbooks_desktop(true)
        end
      elsif xml["statusCode"] == "3100"
        vendor.update_columnsl(search_on_qb: true, sync_qb: true)
      elsif xml["statusCode"] == "3200"
        vendor.update_columnsl(sync_qb: true, qb_d_id: nil, search_on_qb: true)
      elsif xml["statusCode"] == "0" && xml["requestID"] && !vendor.search_on_qb
        vendor.update_columns(qb_d_id: vendor_attrs["list_id"], edit_sequence: vendor_attrs["edit_sequence"], status: vendor_attrs["is_active"] ? 0 : 1)
        vendor.update_column(:sync_qb, false)
        vendor.invoices.each do |invoice|
          invoice.sync_with_quickbooks_desktop(true)
        end
      elsif vendor_attrs && vendor_attrs["list_id"] && vendor.search_on_qb
        vendor.update_columns(qb_d_id: vendor_attrs["list_id"], edit_sequence: vendor_attrs["edit_sequence"], status: vendor_attrs["is_active"] ? 0 : 1)
        vendor.invoices.each do |invoice|
          invoice.sync_with_quickbooks_desktop(true)
        end
      end
    rescue => error
      Airbrake.notify_or_ignore(
        error,
        parameters: response,
        cgi_data: ENV.to_hash,
        error_class: "QuickbooksWC::VendorWorker",
        error_message: "#{response["status_message"]}"
       )
    ensure
      vendor.update_column(:search_on_qb, false)
      reset_job(uniq_business_name)
    end
  end

  def should_run?(job = nil, uniq_business_name)
    user =  User.find_by_uniq_business_name(uniq_business_name)
    return false unless user.authorized_to_sync
    return false if user.sync_count < 2
    user.vendors.where(sync_qb: true).where.not(name: nil).present?
  end

  def update_vendors
    requests
  end

  def reset_job(uniq_business_name)
    QBWC.get_job(:update_vendors).reset if should_run?(self, uniq_business_name)
  end

end
