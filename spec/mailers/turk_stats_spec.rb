describe TurkStats do

  let(:emails) { ["recipient@example.test"] }

  example "#stats" do
    expect {
      TurkStats.stats(stats, emails).deliver
    }.to change { ActionMailer::Base.deliveries.count }
  end

  def stats
    [1.day.ago, 1.week.ago, 1.month.ago, 1.year.ago].map do |date|
      {
        date: date,
        processed_by_turk: 1,
        need_information: 2,
        to_third_worker: 3,
        need_information_stats: 'no stats',
        to_third_worker_stats: ' no stats',
      }
    end
  end

end
