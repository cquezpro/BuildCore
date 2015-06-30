FactoryGirl.define do
  factory :vendor_alert_settings do
    individual
    vendor

    trait :with_all_enabled do
      VendorAlertSettings::TOGGLES.each { |toggle| send toggle, true }
    end
    trait :with_all_disabled do
      VendorAlertSettings::TOGGLES.each { |toggle| send toggle, false }
    end
  end

end
