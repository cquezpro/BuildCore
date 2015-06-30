class WorkerMessage < ActiveRecord::Base
  belongs_to :worker

  before_save :set_worker
  after_create :send_notification

  validates :mt_worker_id, :body, :subject, presence: true

  private

  def send_notification
    RTurk::NotifyWorkers({worker_ids: [worker.mt_worker_id], subject: subject, message_text: body})
  end

  def set_worker
    self.worker = Worker.find_or_create_by(mt_worker_id: mt_worker_id)
    true
  end
end
