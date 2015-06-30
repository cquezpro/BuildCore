class AsscociateAlertSettingsWithIndividuals < ActiveRecord::Migration
  class User < ActiveRecord::Base
    has_many :individuals
    has_many :vendors
    has_one :common_alert_settings, class_name: "CommonAlertSettings"
  end

  class Individual < ActiveRecord::Base
    belongs_to :user
  end

  class Vendor < ActiveRecord::Base
    belongs_to :user
    has_one :alert_settings, class_name: "VendorAlertSettings"
  end

  # It has old and new relations which is correct when it's used
  class CommonAlertSettings < ActiveRecord::Base
    belongs_to :user
    belongs_to :individual
  end

  # It has old and new relations which is correct when it's used
  class VendorAlertSettings < ActiveRecord::Base
    belongs_to :vendor
    belongs_to :individual
  end

  def change
    add_reference :common_alert_settings, :individual, index: true
    add_reference :vendor_alert_settings, :individual, index: true

    reversible do |dir|
      ActiveRecord::Base.transaction do
        dir.up do
          User.includes(:individuals, :common_alert_settings, :vendors => :alert_settings).find_each do |user|
            main_individual = user.individuals.first
            vendors = user.vendors
            change = {individual_id: main_individual.id}

            CommonAlertSettings.where(user: user).update_all change
            VendorAlertSettings.where(vendor: vendors).update_all change
          end
        end

        dir.down do
          User.includes(:vendors, :individuals).find_each do |user|
            main_individual = user.individuals.first
            other_individuals = user.individuals - [main_individual]
            change = {user_id: user.id}

            CommonAlertSettings.where(individual_id: main_individual).update_all change
            # VendorAlertSettings is already associated with correct Vendor; no need to update

            # Delete settings for all but main individual
            CommonAlertSettings.where(individual_id: other_individuals).delete_all
            VendorAlertSettings.where(individual_id: other_individuals).delete_all
          end
        end
      end
    end

    revert do
      add_reference :common_alert_settings, :user, index: true
    end
  end
end
