class ExtractCommonAlertSettingsFromUsers < ActiveRecord::Migration
  class User < ActiveRecord::Base
    has_one :common_alert_settings, inverse_of: :user
  end

  class CommonAlertSettings < ActiveRecord::Base
    belongs_to :user, inverse_of: :common_alert_settings
  end

  def change
    create_table :common_alert_settings do |t|
      t.belongs_to :user, index: true
      column_definitions t
      t.timestamps
    end

    reversible do |dir|
      User.find_each do |user|
        dir.up do
          settings = CommonAlertSettings.new user: user
          move_alert_settings_attributes user, settings
        end

        dir.down do
          settings = user.common_alert_settings
          move_alert_settings_attributes settings, user
        end
      end
    end

    revert do
      change_table :users do |t|
        column_definitions t
      end
    end
  end

  private

  def column_definitions t
    t.boolean  "email_new_invoice_onchange",       default: false
    t.boolean  "email_new_invoice_daily",          default: false
    t.boolean  "email_new_invoice_weekly",         default: true
    t.boolean  "email_new_invoice_none",           default: false
    t.boolean  "email_change_invoice_onchange",    default: false
    t.boolean  "email_change_invoice_daily",       default: false
    t.boolean  "email_change_invoice_weekly",      default: true
    t.boolean  "email_change_invoice_none",        default: false
    t.boolean  "email_paid_invoice_onchange",      default: false
    t.boolean  "email_paid_invoice_daily",         default: false
    t.boolean  "email_paid_invoice_weekly",        default: true
    t.boolean  "email_paid_invoice_none",          default: false
    t.boolean  "email_savings_onchange",           default: false
    t.boolean  "email_savings_daily",              default: false
    t.boolean  "email_savings_invoice_weekly",     default: true
    t.boolean  "email_savings_invoice_none",       default: false
    t.boolean  "email_no_location_found_onchange", default: false
    t.boolean  "email_no_location_found_daily",    default: false
    t.boolean  "email_no_location_found_weekly",   default: true
    t.boolean  "email_no_location_found_none",     default: false
    t.boolean  "text_new_invoice_onchange",        default: false
    t.boolean  "text_new_invoice_daily",           default: false
    t.boolean  "text_new_invoice_weekly",          default: false
    t.boolean  "text_new_invoice_none",            default: true
    t.boolean  "text_change_invoice_onchange",     default: false
    t.boolean  "text_change_invoice_daily",        default: false
    t.boolean  "text_change_invoice_weekly",       default: false
    t.boolean  "text_change_invoice_none",         default: true
    t.boolean  "text_paid_invoice_onchange",       default: false
    t.boolean  "text_paid_invoice_daily",          default: false
    t.boolean  "text_paid_invoice_weekly",         default: false
    t.boolean  "text_paid_invoice_none",           default: true
    t.boolean  "text_savings_onchange",            default: false
    t.boolean  "text_savings_daily",               default: false
    t.boolean  "text_savings_invoice_weekly",      default: false
    t.boolean  "text_savings_invoice_none",        default: true
    t.boolean  "text_no_location_found_onchange",  default: false
    t.boolean  "text_no_location_found_daily",     default: false
    t.boolean  "text_no_location_found_weekly",    default: false
    t.boolean  "text_no_location_found_none",      default: true
  end

  def move_alert_settings_attributes from, to
    @alert_columns ||= begin
      file_src = File.read __FILE__
      alert_column_rx = /\A(email|text)_.*_(onchange|daily|weekly|none)\Z/
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
