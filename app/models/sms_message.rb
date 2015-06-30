class SmsMessage < ActiveRecord::Base
  belongs_to :sms_thread
  belongs_to :number
  belongs_to :alert

  enum message_type: [:invoice_type, :alert_type, :payment_type]
  validates :sms_thread_id, presence: true, if: :invoice_type?
end
