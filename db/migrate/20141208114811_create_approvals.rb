class CreateApprovals < ActiveRecord::Migration
  def change
    create_table :approvals do |t|
      t.string :kind, null: false, default: "regular", index: true
      t.belongs_to :invoice, index: true
      t.belongs_to :approver, index: true
      t.datetime :approved_at

      t.timestamps
    end
  end
end
