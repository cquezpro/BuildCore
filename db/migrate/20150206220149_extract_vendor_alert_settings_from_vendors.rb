class ExtractVendorAlertSettingsFromVendors < ActiveRecord::Migration
  class Vendor < ActiveRecord::Base
    has_one :vendor_alert_settings, inverse_of: :vendor
  end

  class VendorAlertSettings < ActiveRecord::Base
    belongs_to :vendor, inverse_of: :vendor_alert_settings
  end

  def change
    create_table :vendor_alert_settings do |t|
      t.belongs_to :vendor, index: true
      column_definitions t
      t.timestamps
    end

    reversible do |dir|
      Vendor.find_each do |vendor|
        dir.up do
          settings = VendorAlertSettings.new vendor: vendor
          move_alert_settings_attributes vendor, settings
        end

        dir.down do
          settings = vendor.vendor_alert_settings
          move_alert_settings_attributes settings, vendor
        end
      end
    end

    revert do
      change_table :vendors do |t|
        column_definitions t
      end
    end
  end

  private

  def column_definitions t
    t.boolean  "alert_total_text",                default: false
    t.boolean  "alert_total_email",               default: false
    t.boolean  "alert_total_flag",                default: true
    t.boolean  "alert_item_text",                 default: false
    t.boolean  "alert_item_email",                default: false
    t.boolean  "alert_item_flag",                 default: true
    t.boolean  "alert_itemqty_text",              default: false
    t.boolean  "alert_itemqty_email",             default: false
    t.boolean  "alert_itemqty_flag",              default: true
    t.boolean  "alert_itemprice_text",            default: false
    t.boolean  "alert_itemprice_email",           default: false
    t.boolean  "alert_itemprice_flag",            default: true
    t.boolean  "alert_duplicate_invoice_text",    default: false
    t.boolean  "alert_duplicate_invoice_email",   default: false
    t.boolean  "alert_duplicate_invoice_flag",    default: true
    t.boolean  "alert_marked_through_text",       default: false
    t.boolean  "alert_marked_through_email",      default: false
    t.boolean  "alert_marked_through_flag",       default: true
  end

  def move_alert_settings_attributes from, to
    @alert_columns ||= begin
      file_src = File.read __FILE__
      alert_column_rx = /\Aalert_.*_(email|text|flag)\Z/
      alert_columns = from.class.attribute_names.grep alert_column_rx
      # Reject columns not mentioned in this migration, junk, bad ideas etc.
      alert_columns.reject! { |c| !file_src.include? c }
      say "Moving columns from #{from.class.table_name} to #{to.class.table_name}:\n" +
          "#{alert_columns.join ", "}"
      alert_columns
    end

    to.attributes = from.attributes.slice *@alert_columns
    to.save!
  end
end
