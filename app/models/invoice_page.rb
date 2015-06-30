class InvoicePage < ActiveRecord::Base

  belongs_to :worker
  belongs_to :invoice
  belongs_to :survey

end
