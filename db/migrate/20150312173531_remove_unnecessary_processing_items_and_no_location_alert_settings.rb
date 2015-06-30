class RemoveUnnecessaryProcessingItemsAndNoLocationAlertSettings < ActiveRecord::Migration
  def change
    revert do
      change_table "common_alert_settings" do |t|
        t.boolean  "email_no_location_found_onchange", default: false
        t.boolean  "email_no_location_found_daily",    default: false
        t.boolean  "email_no_location_found_weekly",   default: true
        t.boolean  "email_no_location_found_none",     default: false

        t.boolean  "text_no_location_found_onchange",  default: false
        t.boolean  "text_no_location_found_daily",     default: false
        t.boolean  "text_no_location_found_weekly",    default: false
        t.boolean  "text_no_location_found_none",      default: true
      end
    end
  end
end
