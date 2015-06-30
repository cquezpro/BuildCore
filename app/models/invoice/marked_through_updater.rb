# Update Invoice fields from the results obtained by the FIRST invoice moderations workers.
class Invoice::MarkedThroughUpdater < Invoice
  validates :amount_due, presence: true

end
