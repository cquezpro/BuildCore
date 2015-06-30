class ExtractIndividualsFromUsers < ActiveRecord::Migration

  class User < ActiveRecord::Base
    has_many :individuals
  end

  class Individual < ActiveRecord::Base
    belongs_to :user
  end

  def change
    create_table :individuals do |t|
      t.references :user
      email_column_in_context_of_table t
      devise_columns_in_context_of_table t
      t.timestamps
    end

    ActiveRecord::Base.transaction do
      reversible do |dir|
        dir.up do
          User.find_each do |user|
            attrs = devise_attributes_of user
            individual = user.individuals.create! attrs
          end
        end
        dir.down do
          User.includes(:individuals).find_each do |user|
            individual = user.individuals.first
            attrs = devise_attributes_of individual
            user.update! attrs
          end
        end
      end
    end

    revert do
      change_table :users do |t|
        devise_columns_in_context_of_table t
      end
    end
  end

private

  def email_column_in_context_of_table t
    t.string   "email",                         default: "",      null: false
    t.index :email,                             unique: true
  end

  def devise_columns_in_context_of_table t
    # copied from schema as of a249050def903846471fb7b8336e6df3c6a2b22b
    t.string   "encrypted_password",            default: "",      null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.integer  "sign_in_count",                 default: 0,       null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.integer  "failed_attempts",               default: 0,       null: false
    t.string   "unlock_token"
    t.datetime "locked_at"

    t.index :reset_password_token,              unique: true
    t.index :confirmation_token,                unique: true
    t.index :unlock_token,                      unique: true
  end

  def devise_attributes_of record
    attr_names = %w[
      email encrypted_password reset_password_token reset_password_sent_at
      sign_in_count current_sign_in_at last_sign_in_at current_sign_in_ip
      last_sign_in_ip confirmation_token confirmed_at confirmation_sent_at
      unconfirmed_email failed_attempts unlock_token locked_at
    ]
    record.attributes.slice *attr_names
  end

end
