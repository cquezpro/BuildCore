class PaymentsMailer < ActionMailer::Base
  def csv_email(csv, total, checks, ids)
    @checks = checks
    @total = total
    @ids = ids
    @invoices = Invoice.where(id: ids).order('user_id asc, vendor_id asc')

  	date = Date.today
  	attachment_file_name = 'payments_' + date.strftime('%m_%d_%Y') + '.csv'
   	attachments[attachment_file_name] = { mime_type: 'text/csv', content: csv }
    mail(
      to:       ["vkbrihma@gmail.com", "danielfromarg@gmail.com"],
      from:     "BillSync <support@bill-sync.com>",
      subject:  "billSync check file for #{date.strftime('%m/%d/%Y')}"
    )
  end

  def ach_file(users, ach = nil)
    @users = users
    @ach = ach
    date = Date.today

    if users.present?
      file = Tempfile.new("tempfile.ach")
      file.write ach.to_s
      file.rewind
      attachment_file_name = 'ach' + date.strftime('%m_%d_%Y') + '.txt'
      attachments[attachment_file_name] = file.read
    end

    mail(
      to:       ["vijay@bill-sync.com","danielfromarg@gmail.com"],
      from:     "BillSync <support@bill-sync.com>",
      subject:  "billSync ach file for #{date.strftime('%m/%d/%Y')}"
    )
  end
end
