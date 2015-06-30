class QuickbooksSync::Invoices::Bill < Invoice
  validates :amount_due, :due_date, presence: true

  def sync!
    return true unless valid?
    return true unless user.intuit_authentication?
    return true unless vendor && vendor.vendor_ref
    perform_sync
  end

  private

  def perform_sync
    Quickbooks.logger = Rails.logger
    Quickbooks.log = true

    method_type = [qb_id, sync_token].all? ? :update : :create
    response = qb_service_bill.send(method_type, qb_invoice_model)
    update_from_qb_response(response)
  end

  def qb_service_bill
    return @qb_service_bill if @qb_service_bill
    @qb_service_bill ||= Quickbooks::Service::Bill.new
    @qb_service_bill.access_token = user.user_oauth_intuit
    @qb_service_bill.company_id = user.realm_id

    @qb_service_bill
  end

  def qb_invoice_model
    @qb_invoice_model ||= Quickbooks::Model::Bill.new(qb_invoice_params)
  end

  def qb_invoice_params
    attrs = {
      id: qb_id,
      vendor_ref: vendor.vendor_ref,
      sync_token: sync_token,
      line_items: qb_line_items
    }

    if vendor.qb_id
      attrs[:vendor_ref] = vendor.vendor_ref
    else
      vendor.sync_with_quickbooks
      vendor.reload.sync_with_quickbooks
    end

    attrs[:due_date] = due_date if due_date
    attrs[:total] = amount_due if amount_due
    attrs[:doc_number] = number if number
    attrs[:txn_date] = date if date
    attrs
  end

  def update_from_qb_response(response)
    return unless response && response.id
    update_column(:sync_token, response.sync_token)
    update_column(:qb_id, response.id)
  end

  def item_service
    item_service = Quickbooks::Service::Item.new
    item_service.access_token = user.user_oauth_intuit
    item_service.company_id = user.realm_id

    item_service
  end

  def qb_line_items
    items = []
    # line_items_scoped.reload.collect do |line_item|
    line_items_scoped.reload.collect do |line_item|
      response = create_or_update_item(line_item)
      update_line_item_from(line_item, response)
      items << QuickbooksSync::LineItems::BillLineItem.find(line_item.id).to_quickbooks_line_item
    end
    # items << QuickbooksSync::LineItems::BillLineItem.find(line_items_scoped.reload.second.id).to_quickbooks_line_item
    items
  end

  def update_line_item_from(line_item, response)
    line_item.update_column(:qb_id, response.id)
    line_item.update_column(:sync_token, response.sync_token)
  end

  def create_or_update_item(line_item)
    found_item = find_item(line_item.description)
    return found_item if found_item
    item =  Quickbooks::Model::Item.new
    item.name = line_item.description
    item.description = line_item.description
    item_service.create(item)
  end

  def find_item(name)
    query_builder = Quickbooks::Util::QueryBuilder.new
    return unless name
    item_service.query("SELECT * FROM Item WHERE #{query_builder.clause('name', '=', name)}").entries.first
  end

  def item_service
    return @item_service if @item_service

    @item_service ||= Quickbooks::Service::Item.new
    @item_service.access_token = user.user_oauth_intuit
    @item_service.realm_id = user.realm_id
    @item_service
  end
end
