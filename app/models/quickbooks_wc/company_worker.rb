class QuickbooksWC::CompanyWorker < QBWC::Worker

  def requests(job = nil, uniq_business_name)
    {
      company_query_rq: {
        include_ret_element: "CompanyName"
      }
    }
  end

  def handle_response(response, job, request, data, uniq_business_name)
    user = User.find_by_uniq_business_name(uniq_business_name)
    company_name = response["company_ret"]["company_name"]
    if user.qb_company_name
      if user.qb_company_name == company_name
        user.update_attributes(authorized_to_sync: true, last_qb_sync: DateTime.now, qb_wrong_company: nil)
      else
        user.update_attributes(authorized_to_sync: false, qb_wrong_company: company_name)
      end

    else
      user.update_attributes(qb_company_name: company_name, authorized_to_sync: true, last_qb_sync: DateTime.now)
    end
  end

  def should_run?(job, uniq_business_name)
    true
  end

  def get_company
    requests
  end
end


