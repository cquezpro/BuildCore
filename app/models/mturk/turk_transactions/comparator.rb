class Mturk::TurkTransactions::Comparator < ActiveType::Object

  attr_accessor :comparation_results, :missed_descriptions, :all_responses,
    :invoice, :hit, :worker_responses, :matched_items, :fuzzy_matches, :exact_matchs

  # validate :items_presence

  attribute :missed_items, :boolean, default: false
  attribute :responses, :hash

  after_save :run_comparision

  def self.build_with(invoice, hit)
    worker_one, worker_two, worker_three = hit.workers

    items_worker_one = invoice.turk_transactions.not_matched.order("created_at ASC").where(worker_id: worker_one.id)
    items_worker_two = invoice.turk_transactions.not_matched.order("created_at ASC").where(worker_id: worker_two.id)
    items_worker_three = invoice.turk_transactions.not_matched.order("created_at ASC").where(worker_id: worker_three.id) if worker_three

    responses = [
      { worker: worker_one, items: items_worker_one },
      { worker: worker_two, items: items_worker_two }
    ]

    responses << { worker: worker_three, items: items_worker_three } if worker_three

    new(responses: responses, invoice: invoice, hit: hit)
  end

  def worker_responses_count
    invoice.turk_transactions.pluck(:worker_id).uniq.count
  end

  def extended_hit?
    @extended_hit ||= worker_responses_count > 2 || hit.assignments.count > 2 || mt_hit_assignments_count >= 3
  end

  def mt_hit_assignments_count
    @mt_hit ||= RTurk::Hit.find(hit.mt_hit_id).assignments.count
  end

  def run_comparision
    begin
      compare_items and filter_results
      if missing_information? && !extended_hit?
        extend_hit! unless worker_responses_count >= 3
        all_responses.each {|e| e.update_column(:matched, false) }
        invoice.invoice_transactions.destroy_all
      end
    rescue => error
      Airbrake.notify_or_ignore(
        error,
        parameters: {invoice: invoice.as_json, hit: hit.as_json},
        cgi_data: ENV.to_hash,
        error_class: self.class,
        error_message: error.message
       )
    ensure
      return true unless extended_hit? || !missing_information?
      begin
        after_comparation
      ensure
       dispose_hit
      end
    end

    true
  end

  def after_comparation
    update_invoice_status
    destroy_alert_if_exist
    recalculate_score
    save_workers
    pay_workers
  end

  def missing_information?
    !missed_items
  end

  def compare_items
    @comparation_results = Hash.new { |hash, key| hash[key] = [] }
    @missed_descriptions = Hash.new { |hash, key| hash[key] = [] }
    @all_responses = responses.collect{|e| e[:items] }.flatten!
    @worker_responses = responses.collect{|e| e[:items] }.sort { |x,y| y.length <=> x.length }
    @exact_matchs = []
    @fuzzy_matches = []
    max_responses = worker_responses.shift
    worker_responses.flatten!
    fz_responses = FuzzyMatch.new(worker_responses, read: :description, find_all_with_score: true)

    all_responses.each do |r|
      next unless r.description.present?
      @comparation_results[r.description] << r
    end

    @comparation_results.each_pair do |k,v|
      if v.size > 1
        exact_matchs << v
        v.each {|e| worker_responses.delete(e)}
      end
    end
    max_responses.each do |item|
      next unless item.description.present?
      exact_match_found = @comparation_results[item.description]
      next if exact_match_found && exact_match_found.size > 1
      if (result = fz_responses.find(item.description)) && result.first && (result.first.second > 0.85 || result.first.third > 0.85)
        to_push = []

        fuzied = false
        worker_responses.delete(result.first.first)
        result.each do |array|
          if array.second > 0.85 || array.third > 0.85
            fuzied = true
            to_push << array
            worker_responses.delete(array.first)
          end
        end

        to_push << [item, to_push.first.second, to_push.first.third] if to_push.first

        if result.first && fuzied
          exact_match_found = @comparation_results[result.first.first.description]
          next if exact_match_found.size > 1
        end

        next if result.first && fuzied &&

        @fuzzy_matches << to_push
        fz_responses = FuzzyMatch.new(worker_responses, read: :description, find_all_with_score: true)
      else
        # implement code for third hit
      end
    end
    true
  end

  def filter_results
    fz = FuzzyMatch.new(invoice.vendor.line_items, read: :description, find_with_score: true)
    @comparation_results = Hash.new { |hash, key| hash[key] = [] }
    @missed_descriptions = Hash.new { |hash, key| hash[key] = [] }

    exact_matchs.each do |array|
      first = array.first
      result = fz.find(first.description)
      if result && [result.second, result.third].all? {|e| e > 0.8 }
        create_invoice_transaction_with(result.first.id, array)
      else
        create_item_and_associate(first.description, array)
      end
    end

    fuzzy_matches.each do |array|
      results = []
      array.each {|e| results << fz.find(e.first.description) }
      results.compact!
      if results.detect {|e| e.second && e.second > 0.85 || e.third > 0.85 }
        result = results.detect {|e| e.second > 0.85 || e.third > 0.85 }
        create_invoice_transaction_with(result.first.id, array.collect(&:first))
      else
        result = array.detect {|e| e.second > 0.85 || e.third > 0.85 }

        create_item_and_associate(result.first.description, array.collect(&:first))
      end
    end
  end

  def create_invoice_transaction_with(item_id, transactions)
    hash = Hash.new { |hash, key| hash[key] = [] }
    ts = TurkTransaction.where(id: transactions.collect(&:id))

    ts.each do |e|
      [:quantity, :total, :discount, :price].each do |attr|
        # Code here to detect dupplicates!
        hash[attr] << e.send(attr)
      end
    end
    ts_attributes = {}
    hash.each_pair do |key, values|
      ts_attributes[key] = values.detect {|e| values.count(e) > 1 }
    end

    ts_attributes.merge!(line_item_id: item_id, invoice: invoice)

    if ts_attributes[:total].present?
      its = InvoiceTransaction.create(ts_attributes)
      ts.update_all(matched: true)

      increment_matched_responses(transactions)
    elsif ts.count >= 3
      ts.update_all(matched: false)
    end
    # space to implement payments here
  end

  def increment_matched_responses(transactions)
    # [{worker, response_id}]
    transactions.each do |value|
      responses.map { |e| e[:worker].add_line_item_match if value.worker == e[:worker] }
    end
  end

  def create_item_and_associate(description, turk_transactions)
    codes = turk_transactions.collect(&:code)
    code = codes.detect {|e| codes.count(e) > 1 }
    item = LineItem.create(vendor: invoice.vendor, description: description, code: code)
    create_invoice_transaction_with(item.id, turk_transactions) if item.valid?
  end


  def update_invoice_status
    invoice.reload
    if invoice.is_a_valid_invoice?
      return if invoice.ready_for_payment? || invoice.payment_queue?
      invoice.info_complete! unless invoice.hits_active?("for_line_item")
    else
      invoice.need_information! unless invoice.need_information?
    end
  end

  def punish_worker(worker)
    worker.update_attributes(score: worker.score - 1) if worker
  end

  def dispose_hit
    return if Rails.env.test?
    hit_id = invoice.hits.for_line_item.first.try(:id)
    ::Hits::Review.complete!(hit_id, true)
  end

  def destroy_alert_if_exist
    invoice.total_alerts.processing_items.destroy_all
  end

  def extend_hit!
    return true if Rails.env.test?
    if !Hits::Review.extend_hit!(hit.id)
      after_comparation
    end
  end

  def pay_workers
    responses.each do |value|
      worker = value[:worker]
      reward = Mturk::Workers::BonusCalculator.calculate(worker.line_item_match)
      assignment = hit.assignments.where(worker_id: worker.id).first
      next if reward > 1 || reward.zero? || reward.nil?
      next unless assignment
      return if Rails.env.test?
      RTurk::GrantBonus.create({
        assignment_id: assignment.mt_assignment_id,
        amount: reward,
        feedback: "You have been rewarded with #{reward} for you work!",
        worker_id: worker.mt_worker_id
      })
      # MtWorkerPaymentWorker.perform_async(assignment.mt_assignment_id, worker.mt_worker_id, reward)
    end
  end

  def recalculate_score
    max_responses = all_responses
    max_responses.each do |item|
      fz = FuzzyMatch.new(max_responses, read: :description, find_all_with_score: true)
      next unless item.description.present?
      results = fz.find(item.description)
      next unless results.any?
      item1 = results.first
      item2 = results.second if results.second && results.second.third > 0.9
      next unless item1.third > 0.85
      max_responses.delete(item1)
      max_responses.delete(item2) if item2
      fz = FuzzyMatch.new(max_responses, read: :description, find_all_with_score: true)
      responses = [item, item1.first, item2.try(:first)].compact
      responses_comparator = Mturk::ResponsesComparator.new(
        {responses: responses, comparation_attributes: [:description, :total, :discount, :quantity, :price, :code], should_save_worker_calculation: true}
      )
      responses_comparator.save
    end
  end

  def save_workers
    responses.each do |e|
      e[:worker].try(:save)
    end
  end
end
