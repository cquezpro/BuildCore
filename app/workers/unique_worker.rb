class UniqueWorker
  include Sidekiq::Worker

  sidekiq_options({
    # Should be set to true (enables uniqueness for async jobs)
    # or :all (enables uniqueness for both async and scheduled jobs)
    unique: :true,

    # Unique expiration (optional, default is 30 minutes)
    # For scheduled jobs calculates automatically based on schedule time and expiration period
    expiration: 24 * 60 * 60
  })

  def perform
    Mturk::Surveys::Hits::Creator.try_to_create_hit
  end
end
