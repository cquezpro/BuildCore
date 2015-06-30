desc "Mechanical Turk Task"
namespace :mturk do
  desc "Stats for mturk HITs"
  task :stats => [:environment] do

    stats = []

    [1.day.ago, 1.week.ago, 1.month.ago, 1.year.ago].each do |date|
      date = date.at_beginning_of_day.to_date
      processed_by_turk = Invoice.in_process.where('created_at >= ?', date).count

      need_information = Invoice.includes(:hits).where('invoices.created_at >= ?', date).need_information.where.not('hits.invoice_id' => nil).where('hits.status in (0,1)').count

      to_third_worker = Hit.joins(:invoice).second_review.where('hits.created_at >= ? and invoices.status = 2', date).count

      need_information_stats = 'no stats'
      to_third_worker_stats = ' no stats'

      if processed_by_turk > 0
        need_information_stats = need_information * 100 / processed_by_turk

        to_third_worker_stats = to_third_worker * 100 / processed_by_turk
      end

      stats << {
        date: date,
        processed_by_turk: processed_by_turk,
        need_information: need_information,
        to_third_worker: to_third_worker,
        need_information_stats: need_information_stats,
        to_third_worker_stats: to_third_worker_stats
      }
    end

    emails = ['vkbrihma@gmail.com', 'danielfromarg@gmail.com']
    TurkStats.stats(stats, emails).deliver

  end
end
