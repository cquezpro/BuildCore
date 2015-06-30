class Api::V1::InvoiceTurkSerializer < Api::V1::CoreSerializer
  attr_reader :options

  attributes :id, :pdf_url, :pdf_file_name, :pdf_content_type,
             :pdf_file_size, :pdf_updated_at, :failed_items,
             :invoice_survey_id, :is_invoice,
             :vendor_present, :address_present, :amount_due_present,
             :line_items_count, :is_marked_through,
             :survey_agreement, :vendor_id, :pdf, :pdf_total_pages, :pdf_page,
             :total_line_items, :unaccounted, :tax, :other_fee, :amount_due,
             :show_unaccounted

  attribute :vendor

  def unaccounted
   object.get_default_item.try(:total)
  end

  def show_unaccounted
    return true if pdf_total_pages === 1
    arr = []
    pdf_total_pages.times do |i|
      arr << object.can_create_hit_for_page?(i + 1)
    end
    arr.all?
  end

  def vendor
    Api::V1::VendorDefaultSerializer.new(object.vendor)
  end

  def line_items_count
    return unless options[:hit].page_number
    object.comparation_result_for_page(options[:hit].page_number)
  end

  def pdf_page
    return unless options[:hit]
    options[:hit].page_number
  end
end
