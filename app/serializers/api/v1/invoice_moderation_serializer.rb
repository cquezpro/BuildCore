class Api::V1::InvoiceModerationSerializer < Api::V1::CoreSerializer
  attributes :id, :invoice_id, :number, :vendor_id, :amount_due, :tax,
      :other_fee, :due_date, :date,
      :status, :created_at, :updated_at, :hit_id, :worker_id,
      :assignment_id, :moderation_type, :name, :address1,
      :address2, :city, :state, :zip, :pdf_url, :selected,
      :original_invoice, :original_values


    def original_values
      {
        vendor_id: object.invoice.vendor_id,
        name: object.name,
        amount_due: object.amount_due,
        address1: object.address1,
        address2: object.address2,
        city: object.city,
        state: object.state,
        zip: object.zip
      }
    end


  end
