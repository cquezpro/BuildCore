class QuickbooksSync::Users::UserAccountsSync < ActiveType::Record[User]
  Quickbooks.logger = Rails.logger
  Quickbooks.log = true

  def sync!
    all_accounts.entries.each do |record|
      QuickbooksSync::Accounts::Account.sync!(record, id)
    end
    all_classes.each do |record|
      QuickbooksSync::Locations::QBClassesSync.sync!(record, id)
    end
    set_account_defaults
    set_default_class
    true
  end

  private

  def all_classes
    class_service.query("SELECT * FROM Class").entries
  end

  def set_account_defaults
    set_account_liablility_default unless liability_account_id.present?
    set_account_expense_default unless expense_account_id.present?
    set_account_bank_default unless bank_account_id.present?
  end

  def set_account_liablility_default
    update_attribute(:liability_account_id, accounts.where(name: "Accounts Payable (A/P)").first.try(:id))
  end

  def set_account_expense_default
    update_attribute(:expense_account_id,  accounts.where(name: "Cost of Goods Sold").first.try(:id))
  end

  def set_account_bank_default
    update_attribute(:bank_account_id,  accounts.where(account_type: "Bank").first.try(:id))
  end

  def set_default_class
    update_attribute(:default_class_id, qb_classes.first.try(:id)) unless default_class_id.present?
  end

  def fetch_accounts
    account_service.query("SELECT * FROM Account WHERE #{query_string}")
  end

  def all_accounts
    arr = []
    arr << account_service.query("SELECT * FROM Account WHERE #{query_string("Expense")}").entries
    arr << filter_accounts(account_service.query("SELECT * FROM Account WHERE #{query_string("Liability")}").entries)
    arr << account_service.query("SELECT * FROM Account WHERE #{query_string("Bank", "AccountType")}").entries
    arr.flatten
  end

  def query_builder
    @query_builder ||= Quickbooks::Util::QueryBuilder.new
  end

  def filter_accounts(arr)
    acc_payable = arr.select { |e| e.name == "Accounts Payable (A/P)" }.first
    arr.select {|e| e.parent_ref.try(:value) == acc_payable.id.to_s }.unshift(acc_payable)
  end

  # def query_string
  #   types = %w{Expense Liability}
  #   query_builder.clause("Classification", "=",  "Expense")
  # end

  def query_string(type, query_for = "Classification")
    query_builder.clause(query_for, "=",  type)
  end

  def account_service
    return @account_service if @account_service

    @account_service ||= Quickbooks::Service::Account.new
    @account_service.access_token = user_oauth_intuit
    @account_service.realm_id = realm_id
    @account_service
  end

  def class_service
    return @class_service if @class_service

    @class_service ||= Quickbooks::Service::Class.new
    @class_service.access_token = user_oauth_intuit
    @class_service.realm_id = realm_id
    @class_service
  end

end
