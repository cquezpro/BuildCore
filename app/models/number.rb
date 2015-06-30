class Number < ActiveRecord::Base
  include TwilioMessages::TwilioClient

  RESTRICTED_NUMBERS = %w[+19177461141 +16464959311].map { |n| [n, n[1..-1]] }.flatten

  belongs_to :individual, inverse_of: :number
  # belongs_to :user, through: :individual
  has_many :sms_threads
  has_many :sms_messages

  before_create :parse_number

  validates :string, presence: true, uniqueness: true, length: { minimum: 8, maximum: 12 }
  validate :server_number

  before_save :send_welcome_text
  before_save :clear_selected

  def last_thread(thread_type = nil)
    if thread_type
      sms_threads.send(thread_type).unlocked.order(created_at: :desc).first
    else
      sms_threads.unlocked.order(created_at: :desc).first
    end
  end

  def disable_alert
    alert = sms_messages.last.alert
    invoice = alert.invoice_owner
    case alert.category
    when "invoice_increase_total"
      invoice.vendor.update_attributes(alert_total_text: false)
    when "alert_item_text"
      invoice.vendor.update_attributes(alert_item_text: false)
    when "line_item_quantity"
      invoice.vendor.update_attributes(alert_itemqty_text: false)
    when "line_item_price_increase"
      invoice.vendor.update_attributes(alert_itemprice_text: false)
    when "duplicate_invoice"
      invoice.vendor.update_attributes(alert_duplicate_invoice_text: false)
    when "manual_adjustment"
      invoice.vendor.update_attributes(alert_marked_through_text: false)
    end
    nil
  end

  def send_welcome_text
    return true unless string_changed?
    sms_bodies = ["Welcome to billSync! Text us a picture of your bill. Single page bill? Just send a picture. For multipage text 'm' before starting and ‘d' after the last page.", "To unsubscribe a number type 'unsubscribe' your number can only be subscribed to one account at a time."]
    sms_bodies.each do |sms_body|
      begin
        twilio_client.account.messages.create(:from => SERVER_NUMBER,
                                              :to => string,
                                              :body => sms_body)
      rescue Twilio::REST::RequestError => e
        errors.add(:string, "The number '#{string}' is not a valid phone number.")
        false
      end
    end
  end

  def server_number
    errors.add(:string, "this number is not available") if RESTRICTED_NUMBERS.include?(string)
  end

  def parse_number
    return unless string.present?
    if string.starts_with?('1') && string.length >= 10
      self.string = "+#{string}"
    else
      self.string = "+1#{string}" unless string.starts_with?('+')
    end
    true
  end

  def clear_selected
    return true unless selected_changed?
    return true unless selected
    user.numbers.update_all(selected: false)
    true
  end

end
