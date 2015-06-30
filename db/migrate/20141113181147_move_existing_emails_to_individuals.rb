# This should be (possibly) removed.  Too many problems with this migration.
#
# The initial idea was to create individuals basing on former emails table.
# However, there was lot of inconsistency there.  It was not guaranteed that
# there's no value which is present both in emails.string and users.email
# columns.  In fact such situation occured on staging.  This led to unique
# constraint violation on individuals.email column.
class MoveExistingEmailsToIndividuals < ActiveRecord::Migration

=begin
  class User < ActiveRecord::Base
    has_many :individuals
    has_many :emails
  end

  class Individual < ActiveRecord::Base
    belongs_to :user
  end

  class Email < ActiveRecord::Base
    belongs_to :user
  end

  def change
    ActiveRecord::Base.transaction do
      reversible do |dir|
        dir.up do
          move_emails_to_individuals
        end
        dir.down do
          move_additional_individuals_to_emails
          already_created_emails = Email.pluck(:string)
          recreate_emails_from_users(already_created_emails)
        end
      end
    end
  end

  def move_emails_to_individuals
    Email.includes(:user).find_each do |email|
      next if email.string == email.user.email
      attrs = {
        email: email.string,
        encrypted_password: email.user.individuals.first.encrypted_password,
        created_at: email.created_at,
        updated_at: email.updated_at,
      }
      individual = email.user.individuals.create! attrs
    end
  end

  def move_additional_individuals_to_emails
    Individual.joins(:users).where.not("users.email = individuals.email").find_each do |individual|
      attrs = {
        string: individual.email,
        created_at: individual.created_at,
        updated_at: individual.updated_at,
        user_id: individual.user_id,
      }
      Email.create! attrs
    end
  end

  def recreate_emails_from_users already_created_emails
    User.where.not(email: already_created_emails).find_each do |user|
      attrs = {
        string: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
        user_id: user.id,
      }
      Email.create! attrs
    end
  end

=end
end
