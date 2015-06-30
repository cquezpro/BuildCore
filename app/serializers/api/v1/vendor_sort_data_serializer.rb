class Api::V1::VendorSortDataSerializer < Api::V1::CoreSerializer
  include Api::V1::Concerns::InvoiceCollectionSerializer

  has_many :archived, :less_than_30, :more_than_30

  attributes :total_count
end
