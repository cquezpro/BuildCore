class Api::V1::InvoicesIndexSerializer < Api::V1::CoreSerializer

  include Api::V1::Concerns::InvoiceCollectionSerializer

  has_many :need_information, :ready_for_payment, :payment_queue,
      :recently_paid, :in_process, :archived, :dispute,
      :less_than_30, :more_than_30

  attribute :total_count

  def need_information
    super.includes(:vendor).collect {|e| Api::V1::InvoiceHomeSerializer.new(e) }
  end

  def ready_for_payment
    super.includes(:vendor).collect {|e| Api::V1::InvoiceHomeSerializer.new(e) }
  end
  def payment_queue
    super.includes(:vendor).collect {|e| Api::V1::InvoiceHomeSerializer.new(e) }
  end
  def recently_paid
    super.includes(:vendor).collect {|e| Api::V1::InvoiceHomeSerializer.new(e) }
  end
  def in_process
    super.includes(:vendor).collect {|e| Api::V1::InvoiceHomeSerializer.new(e) }
  end
  def archived
    super.includes(:vendor).collect {|e| Api::V1::InvoiceHomeSerializer.new(e) }
  end
  def dispute
    super.includes(:vendor).collect {|e| Api::V1::InvoiceHomeSerializer.new(e) }
  end
  def less_than_30
    super.includes(:vendor).collect {|e| Api::V1::InvoiceHomeSerializer.new(e) }
  end
  def more_than_30
    super.includes(:vendor).collect {|e| Api::V1::InvoiceHomeSerializer.new(e) }
  end

end
