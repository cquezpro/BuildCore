class QuickbooksWC::LineItemWorker < QBWC::Worker

  def requests(job, uniq_business_name)
    user = User.find_by_uniq_business_name(uniq_business_name)
    line_item = user.line_items.where(sync_qb: true).first
    line_item.to_quickbooks_xml!
  end

  def handle_response(r, job, request, data, uniq_business_name)
    xml = r["xml_attributes"]
    line_item_attrs = r["item_non_inventory_ret"]
    line_item = LineItem.find(xml["requestID"])
    if xml["statusCode"] == "3200"
      line_item.update_attributes(qb_d_id: line_item_attrs["list_id"], edit_sequence: line_item_attrs["edit_sequence"])
    elsif xml["statusCode"] == "0" && xml["requestID"] && !line_item.search_on_qb
      line_item.update_columns({ qb_d_id: line_item_attrs["list_id"],
        edit_sequence: line_item_attrs["edit_sequence"], sync_qb: false, search_on_qb: false})
      line_item.sync_associated_invoices
    elsif (line_item_attrs && line_item_attrs["list_id"] && line_item.search_on_qb) || xml["statusCode"] == "3200"
      line_item.update_attributes(qb_d_id: line_item_attrs["list_id"], edit_sequence: line_item_attrs["edit_sequence"])
      line_item.sync_associated_invoices
    end
    line_item.update_column(:search_on_qb, false)
    reset_job(uniq_business_name)
  end

  def should_run?(job, uniq_business_name)
    user =  User.find_by_uniq_business_name(uniq_business_name)
    return false unless user.authorized_to_sync
    user.line_items.where(sync_qb: true).present?
  end

  def update_line_items
    requests
  end

  def reset_job(uniq_business_name)
    QBWC.get_job(:update_line_items).reset if should_run?(self, uniq_business_name)
  end
end
