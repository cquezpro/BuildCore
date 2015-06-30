class QBClass < ActiveRecord::Base
  belongs_to :user, inverse_of: :qb_classes
  has_one :user_class, class_name: "User", inverse_of: :default_class
  has_one :vendor, inverse_of: :bank_account
  has_many :addresses
  has_many :line_items

  def sync_qb_desktop!
    search_on_qb ? query_qb_desktop : to_qb_xml
  end

  def query_qb_desktop
    {
      class_query_rq: {
        xml_attributes: { "requestID" => id },
        full_name: name
      }
    }
  end

  def to_qb_xml
    sync_type = qb_d_id ? :class_mod : :class_add
    outher_wrapper = "#{sync_type}_rq".to_sym
    inner_wrapper = "#{sync_type}".to_sym
    hash = {
      outher_wrapper => {
        xml_attributes: { "requestID" => id },
         inner_wrapper => inner_attributes
      }
    }
  end

  private

  def inner_attributes
    hash = {}
    hash[:list_id] = qb_d_id if qb_d_id
    hash[:edit_sequence] = edit_sequence if edit_sequence
    hash.merge!({
      name: name,
      is_active: true
    })
    # hash[:parent_ref] = { list_id: parent.qb_d_id } if parent && parent.qb_d_id

    hash
  end

end
