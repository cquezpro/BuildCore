class TurkTransaction < ActiveRecord::Base
  belongs_to :worker
  belongs_to :hit
  belongs_to :assignment
  belongs_to :invoice
  has_many :responses, as: :trackable

  scope :not_matched, proc { where(matched: false) }
end
