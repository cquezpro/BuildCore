class CreateAccountsIndividuals < ActiveRecord::Migration
  def change
    create_table :accounts_individuals, id: false do |t|
      t.belongs_to :account, index: true
      t.belongs_to :individual, index: true
    end
  end
end
