class Assignment < ActiveRecord::Base
  belongs_to :worker
  belongs_to :hit
  has_many   :invoice_moderations
  has_many   :turk_transactions
  has_many   :surveys

end
