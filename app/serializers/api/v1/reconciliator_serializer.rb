class Api::V1::ReconciliatorSerializer < Api::V1::CoreSerializer
  has_many :records

  def records
    byebug
    col = []
    ids = current_user.invoices.select("DISTINCT ON(check_number) id").where.not(check_number: nil).collect(&:id)
    finds = Invoice.includes(:vendor).order("check_number DESC").find(ids)
    finds.each do |i|
      col << Api::V1::VendorPaymentReconciliatorSerializer.new(i.vendor, {check_number: i.check_number, check_date: i.check_date, params: @options[:params]})
    end
    col
  end

  def current_user
    current_individual.try(:user)
  end
end
