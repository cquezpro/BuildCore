# Intercom stubbed out for all tests to avoid unnecessary communication.
# Explicitly allow/expect communication in particular specs.
RSpec.configure do |config|

  config.before(:example) do
    class_double("Intercom").as_stubbed_const

    %w[User Company Message].each do |name|
      class_double("Intercom::#{name}").as_stubbed_const
    end
  end

end
