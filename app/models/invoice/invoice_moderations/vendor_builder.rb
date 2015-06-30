class InvoiceModerations::VendorBuilder
  attr_accessor :vendor, :ims, :vendor_id, :missmatch

  def initialize(ims, user = nil, vendor_id = nil)
    @ims = ims
    @user = user
    @vendor_id = nil
    @missmatch = []
  end

  def vendor_params
    hash = {}
    hash[:user] = @user if @user
    attributes = Vendor::VENDOR_BUILDER_ATTRIBUTES
    attributes.each do |field|
      fields = ims.collect {|im| im.send(field) }
      matcher = MatcherService.new(fields)
      if matcher.match?
        hash[field] = matcher.result
      else
        missmatch << field
      end

    end
    hash
  end

  def vendor
    return @vendor if @vendor
    if vendor_id
      @vendor = Vendor.find_by(id: vendor_id)
    end
    params = vendor_params
    if missmatch.present?
      missmatch.each do |field|
        params[field] = nil
      end
    end
    @vendor ||= Vendor.find_or_initialize_by(params)
  end
end
