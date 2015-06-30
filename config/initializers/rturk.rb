RTurk::logger.level = Logger::DEBUG unless Rails.env.test?
RTurk.setup(ENV['MTURK_AWSACCESSKEYID'], ENV['MTURK_AWSSECRETACCESSKEY'], :sandbox => [Rails.env.test?, Rails.env.development?].any?)

# RTurk.setup(ENV['MTURK_AWSACCESSKEYID'], ENV['MTURK_AWSSECRETACCESSKEY'], :sandbox => true)
