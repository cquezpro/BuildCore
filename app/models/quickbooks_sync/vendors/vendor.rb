class QuickbooksSync::Vendors::Vendor < Vendor

  def sync!
    return false unless valid?
    qb_service_vendor = Quickbooks::Service::Vendor.new
    qb_service_vendor.access_token = user.user_oauth_intuit
    qb_service_vendor.company_id = user.realm_id
    if qb_vendor = find_vendor
      update_attributes(qb_id: qb_vendor.id)
    end

    method_type = qb_id ? :update : :create
    response = qb_service_vendor.send(method_type, qb_vendor_model)
    update_from_qb_response(response)
  end

  private

  def find_vendor
    query_builder = Quickbooks::Util::QueryBuilder.new
    return unless name
    qb_vendor_service.query("SELECT * FROM Vendor WHERE #{query_builder.clause('DisplayName', '=', name)}").entries.first
  end

  def qb_vendor_model
    @qb_vendor_model ||= Quickbooks::Model::Vendor.new(qb_vendor_params)
  end

  def qb_vendor_service
    return @qb_vendor_service if @qb_vendor_service

    @qb_vendor_service ||= Quickbooks::Service::Vendor.new
    @qb_vendor_service.access_token = user.user_oauth_intuit
    @qb_vendor_service.realm_id = user.realm_id
    @qb_vendor_service
  end

  def qb_vendor_params
    params = {
      id: qb_id,
      sync_token: sync_token,
      given_name: contact_person,
      company_name: name,
      display_name: name,
      print_on_check_name: name,
      account_number: bank_account_number
    }

    params[:email_address] = email if email.present?
    params[:primary_phone] = qb_phone_builder_for(business_number) if business_number
    params[:mobile_phone] = qb_phone_builder_for(cell_number) if cell_number
    params[:fax_phone] = qb_phone_builder_for(fax_number) if fax_number
    params[:billing_address] = qb_billing_address if address1

    params
  end

  def qb_phone_builder_for(phone)
    qb_phone_builder = Quickbooks::Model::TelephoneNumber.new
    qb_phone_builder.free_form_number = phone
    qb_phone_builder
  end

  def qb_billing_address
    address = Quickbooks::Model::PhysicalAddress.new
    address.line1 = address1
    address.line2 = address2
    address.line3 = address3
    address.city = city
    address.country_sub_division_code = state
    address.postal_code = zip
    address.country = 'United States of America'
    address
  end

  def update_from_qb_response(response)
    return unless response && response.id
    update_column(:sync_token, response.sync_token)
    update_column(:qb_id, response.id)
    update_column(:qb_account_number, response.account_number)
  end
end
