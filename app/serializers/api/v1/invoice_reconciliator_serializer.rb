
class Api::V1::InvoiceReconciliatorSerializer < Api::V1::CoreSerializer
  attributes :id, :amount_due, :date, :number
end
