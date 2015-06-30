class UserSyncWorker
  include Sidekiq::Worker

  def perform(user_id)
    QuickbooksSync::Users::UserAccountsSync.find(user_id).sync!
  end
end
