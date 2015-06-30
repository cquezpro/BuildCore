class QuickbooksWC::VendorsSyncWorker < QBWC::Worker

  def requests(job, uniq_business_name)
    user = User.find_by_uniq_business_name(uniq_business_name)
    {
     vendor_query_rq: user.vendors.where(search_on_qb: true).where.not(name: nil, qb_d_id: nil).collect{|e| { "ListID" => e.qb_d_id } }
    }
  end

  def handle_response(r, job, request, data, uniq_business_name)
    if r.is_a?(Array)
      r = r.collect {|e| e["vendor_ret"] }
      r.compact!
      user = User.find_by_uniq_business_name(uniq_business_name)
      qb_d_ids = []
      r.each do |vendor_attrs|
        if vendor = user.vendors.where(qb_d_id: vendor_attrs["list_id"]).first
          qb_d_ids << vendor_attrs["list_id"]
          vendor.update_columns(qb_d_id: vendor_attrs["list_id"], edit_sequence: vendor_attrs["edit_sequence"])
          vendor.update_column(:search_on_qb, false)
        end
      end
      vendors = user.vendors.where(search_on_qb: true).where.not(qb_d_id: qb_d_ids, name: nil)
      vendors.update_all(sync_qb: true, search_on_qb: false, qb_d_id: nil, edit_sequence: nil)

      reset_job(uniq_business_name)
    else
      if r["xml_attributes"] && r["xml_attributes"]["statusCode"] == "500"
        if qb_d_id = r["xml_attributes"]["statusMessage"].match(/\w{8}-\w{10}/)
          vendor = Vendor.find_by(qb_d_id: qb_d_id.to_s)
          vendor.update_columns(search_on_qb: false, sync_qb: true, qb_d_id: nil)
        else
          vendor = user.vendors.where(search_on_qb: true).where.not(name: nil, qb_d_id: nil).first
          vendor.update_columns(search_on_qb: false, sync_qb: false, qb_d_id: nil)
        end
      else
        vendor_attrs = r["vendor_ret"]
        begin
          vendor = user.vendors.find_by(qb_d_id: vendor_attrs["list_id"])
          vendor.update_columns(qb_d_id: vendor_attrs["list_id"], edit_sequence: vendor_attrs["edit_sequence"], search_on_qb: false)
        rescue => e
          Airbrake.notify_or_ignore(
            e,
            parameters: r,
            cgi_data: ENV.to_hash,
            error_class: "QuickbooksWC::VendorWorker",
            error_message: e.message
           )
          puts e.message
        end

      end
    end

  end

  def should_run?(job = nil, uniq_business_name)
    user =  User.find_by_uniq_business_name(uniq_business_name)
    return false unless user.authorized_to_sync
    user.vendors.where(search_on_qb: true).where.not(name: nil, qb_d_id: nil).present?
  end

  def update_all_vendors
    requests
  end

  def reset_job(uniq_business_name)
    QBWC.get_job(:update_vendors).reset if should_run?(self, uniq_business_name)
  end

end
