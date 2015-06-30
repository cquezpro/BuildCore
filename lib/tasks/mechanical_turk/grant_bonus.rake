namespace :mturk do
  desc "Grant botnus"
  task :grant_bonus => [:environment] do
    RTurk.setup(ENV['MTURK_AWSACCESSKEYID'], ENV['MTURK_AWSSECRETACCESSKEY'], :sandbox => false)

    worker_ids = ['A1BIJGB7XA0GME','A1DMKF1TOOB15X','A1M7DKSUT54LJ9','A23HRNJVXKXS12','A25ROS9CH7PSFZ','A2C8HCH53HHIDQ','A2CEL5AR6LIIJZ','A2ECL5APTWGAR4','A2NG6XFFMS8J10','A2PWBFKI79IFXZ','A2QCBYREDUOIWV','A2Y87RCJ8WE2PV','A2YMCAN6AN9NWF','A2YPZF41N7BFA2','A2ZVWE8XJDWNAD','A30YUELTPFSF0T','A32B29KGYECL83','A33D5LFU31S89H','A38DTCGCPNH77Q','A3C7KGF8I37220','A3CPY2H9OUOEPJ','A3GNUA19YJ4LVL','A3JYD008VKTSVZ','A3KZQNW0QA24OQ','A3N7ZPL8O4I5ZT','A3QRK5OT747FVL','ADLLTV4VB416U','AQVP5IH2S6WCB','AU59W7RRG9LV','AW8MS3KBOFRAS','AWIO57CI1ZBIH','AZ036DSFSAVZ8','A2PTZVAIGEY9ZJ']

    subject = "We added at 25 cent bonus to your account.  Sorry about Spam.  We Realized an Error in our codebase that has been fixed"
    body = "Sorry about the frequent emails on available HITs.  As an apology to you we have added a 25 cent bonus to your account.
    We realized an issue with our code in which the qualifications were not being handled properly.  We have made the fix and now the emails contain a link which will show all HITs available to you.  At the moment there are about 40 HITs available to you as a qualified worker.
    Here is the link:  https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=alto&minReward=0.00&x=0&y=0"

    granted = []
    worker_ids.each do |w_id|
      worker = Worker.where(mt_worker_id: w_id).first
      next unless worker
      assignment = Assignment.where(worker_id: worker.id).first
      next unless assignment
      granted << w_id
      RTurk::GrantBonus.create({
        assignment_id: assignment.mt_assignment_id,
        amount: 0.25,
        feedback: 'Great worker!',
        worker_id: w_id
      })
    end

    RTurk::NotifyWorkers({worker_ids: granted, subject: subject, message_text: body})
  end

end
