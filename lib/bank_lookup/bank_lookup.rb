module BankLookup
  class Config
    class << self
      def file
        @file ||= File.join(File.dirname(__FILE__), 'db.txt')
      end

      def file=(file)
        @file = file
      end
    end
  end

  DB = {}
  class Parser
    def self.parse
      # raise "You must specify a database file" if Config.file.nil?

      File.foreach Config.file do |line|
        routing_number   = line[0..8]
        name = line[35..70].strip
        address = line[71..106].strip
        city = line[107..126].strip
        state = line[127..128]
        zip = line[129..133]

        DB[routing_number] = {:routing_number => routing_number, :name => name, :address => address, :city => city, :state => state, :zip => zip}
      end
    end
  end

  def self.get bank_routing_number
    if bank = DB[bank_routing_number]
      bank
    else
      false
    end
  end
end
