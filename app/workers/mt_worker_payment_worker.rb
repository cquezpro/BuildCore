class MtWorkerPaymentWorker
  include Sidekiq::Worker

  def perform(mt_assignment_id, mt_worker_id, reward)
    return true
    RTurk::GrantBonus.create({
      assignment_id: mt_assignment_id,
      amount: reward,
      feedback: "You have been rewarded with #{reward} for you work!",
      worker_id: mt_worker_id
    })
  end
end
