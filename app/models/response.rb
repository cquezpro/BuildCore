class Response < ActiveRecord::Base
  belongs_to :trackable, polymorphic: true
  belongs_to :worker, inverse_of: :responses
  belongs_to :assignment

  enum status: [:rejected, :accepted]

  scope :today, proc { where("responses.created_at >= ?", Date.today) }
end
