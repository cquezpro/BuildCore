class InvoicesSmsThread < ActiveRecord::Base
  belongs_to :invoice
  belongs_to :sms_thread

  enum status: {
    not_reviewed: 0,
    reviewing: 1,
    deferred: 2,
    reviewed: 3
  }

end
