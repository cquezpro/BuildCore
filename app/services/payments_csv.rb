class PaymentsCSV
  attr_accessor :total, :checks, :csv, :invoices, :ids, :cipher, :users

  private_class_method :new

  HEADER = [
    "Client Number", "Client Name",
    "Address1", "Address2", "City", "State", "Zipcode",
    "Bank Name", "Bank Address", "Bank City", "Bank State", "Bank Zip",
    "Bank Routing", "Bank Account",
    "Payee Name", "Address1", "Address2", "City", "State", "Zip",
    "Invoice Number", "Invoice Date", "Invoice Amount",
    "Check Number", "Check Date",
  ]

  def self.create_and_send!(date = Date.today)
    invoices = invoices_to_send(date).select(&:valid_invoice?)
    instance = new(invoices)
    instance.generate!
    instance.update_users_checknumber
    instance.update_invoice_status
    instance.send_email
    instance
  end

  # Array of invoices (not relation!) which should be sent in CSV.  May contain
  # invoices which `Invoice#valid_invoice?` is false.
  def self.invoices_to_send(date)
    Invoice.order('user_id asc, vendor_id asc').payment_queue.where(payment_send_date: date)
  end

  def initialize(invoices)
    @invoices = invoices
    @total = 0
    @checks = 0
    @ids = []
    @users = []
    @cipher = OpenSSL::PKey::RSA.new Concerns::RSAPublicKeyEncryptor::KEY
    @cipher.private? or raise "Specified keypair does not contain private key"
    self
  end

  def generate!
    n_invoice = 0
    old_vendor = nil
    old_user = nil
    @csv = CSV.generate do |csv|
      csv << HEADER
      invoices.each do |invoice|

        bank = BankLookup.get decrypt_attribute(invoice.user, :routing_number)
        n_invoice += 1
        @total += invoice.amount_due || 0

        increased = false
        if old_user && old_user != invoice.user
          n_invoice = 0
          @checks += 1
          increased = true
        elsif old_vendor && old_vendor != invoice.vendor
          invoice.user.increase_check_number
          n_invoice = 0
          @checks += 1
          increased = true
        end
        invoice.user.reload
        invoice.reload
        @checks += 1 if n_invoice == 1 && !increased

        csv << [
          invoice.user.to_payments_csv, parse_bank_info(bank),
          user_csv_fields(invoice.user), vendor_fields(invoice.vendor),
          invoice.csv_fields
        ].flatten.collect {|e| e ? e : '' }

        ids.push(invoice.id)
        invoice.update_attributes(check_number: invoice.user.check_number, check_date: Date.today)
        users << invoice.user
        if n_invoice == 24
          invoice.user.increase_check_number
          invoice.user.reload
          n_invoice = 0
        end
        old_vendor = invoice.vendor
        old_user = invoice.user
      end
    end
    users.uniq
  end

  def send_email
    PaymentsMailer.csv_email(csv, total, checks, ids).deliver
  end

  def parse_bank_info(bank)
    bank = bank ? bank : {}
    [bank[:name], bank[:address], bank[:city], bank[:state], bank[:zip]]
  end

  def update_invoice_status
    Invoice.find(ids).each do |invoice|
      invoice.check_send!
    end
  end

  def vendor_fields(vendor)
    if vendor.present?
      [:name, :address1, :address2, :city, :state, :zip].map do |an|
        vendor.public_send an
      end
    else
      Array.new '', 6
    end
  end

  def user_csv_fields(user)
    [
      decrypt_attribute(user, :routing_number),
      decrypt_attribute(user, :bank_account_number),
    ]
  end

  def decrypt_attribute(model, attribute_name)
    encrypted = model["encrypted_#{attribute_name}"]
    encrypted.nil? ? nil : cipher.private_decrypt(encrypted)
  end

  def update_users_checknumber
    users.compact.each do |user|
      user.increase_check_number
    end
  end
end
