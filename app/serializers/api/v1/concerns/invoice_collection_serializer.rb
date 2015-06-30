module Api::V1::Concerns::InvoiceCollectionSerializer
  extend ActiveSupport::Concern

  delegate :order_by_act_by, :to => :object

  # Following is necessary because ActiveRecord::Relation does not
  # include ActiveModel::SerializerSupport.
  delegate :less_than_30, :more_than_30, :to => :object

  def need_information
    order_by_act_by.by_status(3,9,10)
  end

  def ready_for_payment
    order_by_act_by.by_status(4)
  end

  def payment_queue
    order_by_act_by.by_status(5)
  end

  def recently_paid
    order_by_act_by.by_status(6,7)
  end

  def in_process
    order_by_act_by.by_status(1,2)
  end

  def archived
    order_by_act_by.by_status(8,13)
  end

  def dispute
    order_by_act_by.by_status(12)
  end

  def total_count
    # Not sure if total count from less and more
    [less_than_30, more_than_30].sum(&:count)
  end
end
