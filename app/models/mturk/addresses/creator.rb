class Mturk::Addresses::Creator < Address
  include Mturk::Concerns::Normalizer

  attr_accessor :invoice_id

  validates :mt_hit_id, :mt_worker_id, :mt_assignment_id, presence: true

  def self.create_address_with(params)
    return false unless params[:address].present?
    return false unless hit = Hit.find_by(mt_hit_id: params[:mt_hit_id])

    worker = Worker.find_or_create_by(mt_worker_id: params[:mt_worker_id])
    Mturk::Assignments::Creator.build_from(params[:mt_assignment_id], worker, hit).save

    this_params = params[:address]
    this_params[:mt_worker_id] = params[:mt_worker_id]
    this_params[:mt_assignment_id] = params[:mt_assignment_id]
    this_params[:mt_hit_id] = params[:mt_hit_id]
    this_params[:created_by] = :by_worker

    instance = create(this_params)

    invoice = Invoice.find(params[:address][:addressable_id])
    return instance unless instance.persisted?
    return instance unless invoice && invoice.addresses.size >= 2
    ::Mturk::Addresses::Comparator.new(invoice).run!

    AddressWorker.delay_for(1.minute).perform_async(invoice.id)
    instance
  end

end
