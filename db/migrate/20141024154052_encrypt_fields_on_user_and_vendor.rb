class EncryptFieldsOnUserAndVendor < ActiveRecord::Migration

  OBFUSCATOR = proc{ |value| "#" * (value.length - 3) + value[-3..-1] }

  class Vendor < ActiveRecord::Base
    include Concerns::RSAPublicKeyEncryptor
    encrypt :routing_number, :bank_account_number, obfuscate_with: OBFUSCATOR
  end

  class User < ActiveRecord::Base
    include Concerns::RSAPublicKeyEncryptor
    encrypt :routing_number, :bank_account_number, obfuscate_with: OBFUSCATOR
  end

  def self.up
    [User, Vendor].each do |model|
      model.find_in_batches do |batch|
        model.transaction do
          batch.each do |record|
            record.routing_number = record.routing_number if record.routing_number.present?
            record.bank_account_number = record.bank_account_number if record.bank_account_number.present?
            record.save! if record.changed?
          end
        end
      end
    end
  end

  def self.down
    raise ActiveRecord::IrreversibleMigration
  end

end
