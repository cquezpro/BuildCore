class InvoiceModerations::MarkedThroughComparator
  attr_accessor :im1, :im2, :im3, :invoice

  def self.build_from(invoice)
    builder = new
    builder.invoice = invoice
    builder.im1 = invoice.invoice_moderations.for_marked_through.not_most_recent[0]
    builder.im2 = invoice.invoice_moderations.for_marked_through.not_most_recent[1]
    builder.im3 = invoice.invoice_moderations.for_marked_through.not_most_recent[2]

    builder
  end

  def run!
    return false unless im1 && im2 && invoice

    begin
      Hits::Review.pay_for(im1.hit.id)
    rescue
    end

    if second_review?
      return comparation_for_second_hit
    else
      return comparation_for_first_hit
    end
  end

  private

  def comparation_for_first_hit
    if same_amount?
      update_invoice(im1)
      clear_hit!
      return true
    else
      InvoiceModerations::ModerationCreator.create_one!(invoice, im1.hit, :for_marked_through)
      Hits::Review.extend_hit!(im1.hit.id)
      return true
    end
    false
  end

  def comparation_for_second_hit
    clear_hit!
    if selected
      update_invoice(selected)
      punish_other_worker!(selected.sibling_record(:for_marked_through).worker.id)
      workers = [selected.worker, im3.worker]
      pay_workers!(workers, im1.hit.reward)
      return true
    end
    begin
      invoice.missing_fields!
    rescue
    end
    false
  end

  def selected
    return @selected if @selected

    [im1,im2].each do |im|
      return @selected = im if equal_amount_due?(im)
    end
    false
  end

  def second_review?
    @second_hit ||= [im1, im2, im3].all? {|im| im.present? && im.submited? }
  end

  def same_amount?
    im1.amount_due == im2.amount_due && im1.amount_due.present? && im2.amount_due.present?
  end

  def equal_amount_due?(im)
    im.amount_due == im3.amount_due && im.amount_due.present? && im3.amount_due.present?
  end

  def update_invoice(im)
    updater = Invoice::MarkedThroughUpdater.find(invoice.id)
    updater.amount_due = im.amount_due if updater.amount_due.nil? || updater.amount_due.to_s == '0.0'
    updater.save
    invoice.reload
    update_invoice_status
  end

  def update_invoice_status
    calculate_score
    if invoice.is_a_valid_invoice?
      invoice.create_line_items_hit
      unless invoice.hits_active?('marked_through')
        return if invoice.ready_for_payment? || invoice.payment_queue?
        invoice.info_complete!
      end
    else
      invoice.need_information! unless invoice.need_information?
    end
  end

  def clear_hit!
    Hits::Review.complete!(im1.hit_id)
  end

  def punish_other_worker!(worker_id)
    begin
      worker = Workers::Punisher.find(worker_id)
      worker.punish_worker!
    rescue
      nil
    end
  end

  def pay_workers!(workers = [], reward)
    workers.each do |worker|
      ::Workers::Payment.payment_for(worker, reward, true)
    end
    true
  end

  def calculate_score
    Mturk::ResponsesComparator.new(
      {
        responses: invoice.invoice_moderations.for_marked_through, comparation_attributes: [:amount_due],
        should_save_worker_calculation: true
      }
    ).save
    [im1, im2, im3].compact.map(&:save)
  end
end
