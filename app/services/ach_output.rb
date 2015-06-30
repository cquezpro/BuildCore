require 'ach'

class AchOutput
  attr_accessor :cipher, :users

  def initialize(users)
    @users = users
    @cipher = OpenSSL::PKey::RSA.new Concerns::RSAPublicKeyEncryptor::KEY
    @cipher.private? or raise "Specified keypair does not contain private key"
  end

  def run!
    ach = ACH::ACHFile.new
    trace_number = 0

    # File Header
    fh = ach.header
    fh.immediate_destination = "321081669"
    fh.immediate_destination_name = "FIRST REPUBLIC BANK"
    fh.immediate_origin = "1471861949"
    fh.immediate_origin_name = "billSync"

    return unless users.any?
    fields = [:first_amount_verification, :second_amount_verification]

    # Batch
    batch = ACH::Batch.new
    bh = batch.header
    bh.company_name = "billSync Verify"
    bh.company_identification = "1471861949" # Use 10 characters if you're not using an EIN
    bh.standard_entry_class_code = 'CCD'
    bh.company_entry_description = "Verify bank account"
    bh.company_descriptive_date = Date.today
    bh.effective_entry_date = (Date.today + 1)
    bh.originating_dfi_identification = "32108166"
    ach.batches << batch

    users.each do |user|
      next unless [decrypt_attribute(user, :routing_number).try(:to_s), decrypt_attribute(user, :bank_account_number).try(:to_s)].all?(&:present?)
      user.set_sample_ammounts
      user.save
      fields.each do |user_field|
        # Detail Entry
        ed = ACH::EntryDetail.new
        ed.transaction_code = ACH::CHECKING_CREDIT
        ed.routing_number = decrypt_attribute(user, :routing_number).try(:to_s)
        ed.account_number = decrypt_attribute(user, :bank_account_number).try(:to_s)
        ed.amount = user.send(user_field) * 100
        ed.individual_id_number = "#{user.id}"
        ed.individual_name = user.business_name
        ed.originating_dfi_identification = '32108166'
        batch.entries << ed
      end

      # Detail Entry
      ed = ACH::EntryDetail.new
      ed.transaction_code = ACH::CHECKING_DEBIT
      ed.routing_number = "321081669"
      ed.account_number = "80001890558"
      ed.amount = user.total_verification_deposited * 100
      ed.individual_id_number = "#{user.id}"
      ed.individual_name = "Scotty's Lab's"
      ed.originating_dfi_identification = '32108166'
      batch.entries << ed
      batch.entries.each{ |entry| entry.trace_number = (trace_number += 1) }

      user.update_column(:ach_date, 1.business_day.from_now)
    end
    ach
  end


  def decrypt_attribute(model, attribute_name)
    encrypted = model["encrypted_#{attribute_name}"]
    encrypted.nil? ? nil : cipher.private_decrypt(encrypted)
  end

end
