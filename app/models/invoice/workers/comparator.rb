class Workers::Comparator
  attr_reader :worker_one, :worker_two

  def initialize(worker_one, worker_two)
    @worker_one = worker_one
    @worker_two = worker_two
  end

  def self.build_with_invoice_moderation(invoice_moderations)
    worker_one = invoice_moderations.default.first.worker
    worker_two = invoice_moderations.default.second.worker
    new(worker_one, worker_two)
  end

  def comparate_by_score
    return worker_one if worker_one.score > worker_two.score
    return worker_two if worker_two.score >= worker_one.score

    false
  end

end
