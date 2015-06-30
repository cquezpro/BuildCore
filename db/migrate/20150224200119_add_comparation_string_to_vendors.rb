class AddComparationStringToVendors < ActiveRecord::Migration
  def change
    add_column :vendors, :comparation_string, :string

    Vendor.find_each do |vendor|
      vendor.save
    end
  end
end
