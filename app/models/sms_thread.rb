class SmsThread < ActiveRecord::Base

  before_save :can_save?

  belongs_to :user
  belongs_to :invoice
  belongs_to :number
  has_many :sms_messages

  has_many :invoices_sms_threads
  has_many :invoices, through: :invoices_sms_threads

  enum thread_type: [:single, :multiple, :unsubscribe, :payment]
  enum status: [:unlocked, :locked]

  def can_save?
    return true if status_changed?
    unlocked?
  end
end
