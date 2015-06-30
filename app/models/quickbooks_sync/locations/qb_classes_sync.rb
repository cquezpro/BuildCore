class QuickbooksSync::Locations::QBClassesSync < QBClass
  attr_accessor :qb_model

  def self.sync!(qb_model, user_id)
    user = User.find(user_id)
    instance = find_or_initialize_by(qb_id: qb_model.id, user_id: user_id)
    instance.qb_model = qb_model
    instance.user_id = user_id
    instance.set_attributes_from_qb_model
    instance.save
  end

  def set_attributes_from_qb_model
    self.qb_id = qb_model.id
    self.sync_token = qb_model.sync_token
    self.name = qb_model.name
    self.qb_parent_id = qb_model.parent_ref
    self.active = qb_model.active?
    self.fully_qualified_name = qb_model.fully_qualified_name
    self.sub_class = qb_model.sub_class
  end
end
