# Class for descending dollar view
class Api::V1::VendorPaymentReconciliatorSerializer < Api::V1::CoreSerializer
  attributes :id, :name, :address1, :city, :zip, :bills, :check_number,
              :check_date, :check_total

  def check_number
    @options[:check_number]
  end

  def check_date
    @options[:check_date]
  end

  def bills
    bills_association.collect {|e| Api::V1::InvoiceReconciliatorSerializer.new(e, root: false) }
  end

  def check_total
    bills_association.sum(:amount_Due)
  end

  def filter_by_check_date?
    @options[:by_check_date]
  end

  private

  def start_date
    @options[:start_date]
  end

  def end_date
    @options[:end_date]
  end

  def bills_association
    @bills_association ||= if start_date || end_date
      object.invoices.where(check_number: check_number).by_period(start_date, end_date)
    elsif filter_by_check_date?
      object.invoices.where(check_number: check_number).where("check_date >= ? OR check_date = ?", Date.parse(@options[:by_check_date]), nil)
    else
      object.invoices.where(check_number: check_number)
    end
  end
end
