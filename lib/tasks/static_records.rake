namespace :static_records do

  task :all => [:stock_roles]

  ##########

  desc "Reset the stock roles"
  task :stock_roles => :prepare do
    admin_permissions = Permission::RAW
    admin_permissions.delete([:accountant_approve, Invoice])

    stock_role_definitions = {
      "Administrator" => admin_permissions,

      "Accountant 1" => [
        [:read, Invoice],
        [:manage, Invoice],
        [:manage, Alert],
        [:read, Vendor],
        [:manage, Vendor],
        [:read, :today],
        [:manage, :approval],
        [:read, :approval],
        [:update_when_approving, Invoice],
        [:regular_approve, Invoice],
        [:update, Invoice],
        [:read, Payment],
        [:record, Payment],
        [:pay_unassigned, Payment],
        [:read, User],
        [:update, User],
        [:read_accounting, Vendor],
        [:manage_accounting, Vendor],
        [:read_terms, Vendor],
        [:manage_terms, Vendor],
        [:read_incomplete, Invoice],
        [:accountant_approve, Invoice],
        [:synchronize, :all],
        [:update_password, :himself],
      ],

      "Junior Accountant" => [
        [:read, :today],
        [:read, Invoice],

        [:read, Vendor],
        [:record, Payment],
        [:read, User],
        [:update, User],
        [:read_accounting, Vendor],
        [:manage_accounting, Vendor],
        [:read_terms, Vendor],
        [:read_incomplete, Invoice],
        [:accountant_approve, Invoice],
        [:update_password, :himself]
      ],

      "Clerk" => [
        [:read, :today],
        # [:read, Invoice],
        [:read_incomplete, Invoice],
        [:update, Invoice],
        [:text, Invoice],
        [:email, Invoice],
        [:read, User],
        [:update_password, :himself],
      ],

      "Payer" => [
        [:read, :today],
        [:read, Invoice],
        [:manage, Invoice],
        [:read, Payment],
        [:record, Payment],
        [:read, Account],
        [:pay_approved, Payment],
        [:read, User],
        [:update_password, :himself],
      ],

      "Approver" => [
        [:read, Invoice],
        [:read, :today],
        [:manage, :approval],
        [:read, :approval],
        [:update_when_approving, Invoice],
        [:regular_approve, Invoice],
        [:update, Invoice],
        [:read_incomplete, Invoice],
        [:text, Invoice],
        [:email, Invoice],
        [:read, User],
        [:update_password, :himself],
      ]
    }

    Role.transaction do
      stock_role_definitions.each do |role_name, raw_permissions|
        role = Role.stock.where(name: role_name).first_or_initialize

        perm_keys_array = raw_permissions.map do |raw_perm|
          perm = Permission::ALL.values.detect do |perm|
            [perm.action, perm.subject] == raw_perm
          end

          perm.try(:key) or raise "Unavailable permission: #{raw_perm.inspect}"
        end

        role.permissions = perm_keys_array
        role.save!
      end
    end
  end

  ##########

  task :prepare => :environment

end
