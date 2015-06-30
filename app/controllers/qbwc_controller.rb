class QbwcController < ApplicationController
  include QBWC::Controller
  before_filter :authenticate_individual!, only: [:qwc]

def qwc
    current_individual.user.sync_with_quickbooks_desktop
      # Optional tag
      scheduler_block = ''
      if !QBWC.minutes_to_run.nil?
        scheduler_block = <<SB
   <Scheduler>
      <RunEveryNMinutes>#{QBWC.minutes_to_run}</RunEveryNMinutes>
   </Scheduler>
SB
      end
      file_id = Rails.env.production? ? "{90A44FB5-33D9-4815-AC85-BC87A7E7D1EB}" : "{90A44FB5-33D9-4815-AC85-BC87A7E7D1EC}"


      qwc = <<QWC
<QBWCXML>
   <AppName>#{Rails.application.class.parent_name} #{Rails.env} #{@app_name_suffix}</AppName>
   <AppID></AppID>
   <AppURL>#{qbwc_action_path(:only_path => false)}</AppURL>
   <AppDescription>Quickbooks integration</AppDescription>
   <AppSupport>#{QBWC.support_site_url || root_url(:protocol => 'https://')}</AppSupport>
   <UserName>#{current_individual.user.uniq_business_name || QBWC.username}</UserName>
   <OwnerID>#{QBWC.owner_id}</OwnerID>
   <FileID>#{file_id}</FileID>
   <QBType>QBFS</QBType>
   <Style>Document</Style>
   #{scheduler_block}
</QBWCXML>
QWC
      send_data qwc, :filename => "#{@filename || Rails.application.class.parent_name}.qwc", :content_type => 'application/x-qwc'
    end

  def close_connection
    current_user = User.find_by_uniq_business_name(@session.user || QBWC.username)
    if current_user.present?
      current_user.add_sync_count
    end
    @session.destroy
    render :soap => {'tns:closeConnectionResult' => 'OK'}
  end
end
