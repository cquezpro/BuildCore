QBWC.configure do |c|

  #Currently Only supported for single logins.
  # c.username = "foo"
  # c.password = "bar"

  c.authenticator = Proc.new{|username, password|
    # qubert can access Oceanic
    if !username.present?
      nil
    else
      user = User.find_by_uniq_business_name(username)
      if user && user.file_password == password
        next ''
      else
        nil
      end
    end
  }

  c.session_initializer = Proc.new{|session|
   @user_name = session.user
  }

  #Path to Company File (blank for open or named path or function etc..)
  c.company_file_path = ""

  #Minimum Quickbooks Version Required for use in QBXML Requests
  c.min_version = "10.0"

  #Quickbooks Type (either :qb or :qbpos)
  c.api = :qb

  # Storage module
  c.storage = :active_record

  #Quickbooks Support URL provided in QWC File
  if Rails.env.production?
    c.support_site_url = "https://www.bill-sync.com"
  else
    c.support_site_url = ENV["host"] || 'https://94daea6.ngrok.com'
  end

  #Quickbooks Owner ID provided in QWC File
  c.owner_id = Rails.env.production? ? '{57F3B9B1-86F1-4fcc-B1EE-566DE1813D21}' : '{57F3B9B1-86F1-4fcc-B1EE-566DE1813D22}'

  #How often to run web service (in minutes)
  c.minutes_to_run = 120

  # In the event of an error in the communication process do you wish the sync to stop or blaze through
  #
  # Options:
  # :stop
  # :continue
  c.on_error = :continue

  # Rails Cache Hot Boot  (Check the rails cache for existing API object to speed app boot)
  # This Feature is Unstable and is Extreme Alpha.  IT is known not to work
  # c.warm_boot = false

  # Logger to use
  c.logger = Rails.logger
end

# QBWC.add_job(:update_vendors, true, '', QuickbooksWC::VendorWorker)
# QBWC.add_job(:update_line_items, true, '', QuickbooksWC::LineItemWorker)
# QBWC.add_job(:update_accounts, true, '', QuickbooksWC::AccountWorker)
# QBWC.add_job(:update_classes, true, '', QuickbooksWC::QBClassWorker)
# QBWC.add_job(:update_bills, true, '', QuickbooksWC::BillWorker)
# QBWC.add_job(:update_accounts, false, '', QuickbooksWC::AccountSyncWorker)

