require File.expand_path('../../config/boot',        __FILE__)
require File.expand_path('../../config/environment', __FILE__)
require 'clockwork'

include Clockwork
every(8.hours, 'Queueing Scheduled job') { MturkNotificationsWorker.perform_async }
