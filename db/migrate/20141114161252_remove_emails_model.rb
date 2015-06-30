class RemoveEmailsModel < ActiveRecord::Migration
  def change
    revert do
      # Copied from schema as of 89294fa193e0234a7da0bc99218ff7bb6a29cb22
      create_table "emails" do |t|
        t.integer  "user_id"
        t.string   "string"
        t.datetime "created_at"
        t.datetime "updated_at"
      end
    end
  end
end
