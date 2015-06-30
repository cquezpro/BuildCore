class AddModerationTypeToInvoiceModerations < ActiveRecord::Migration
  def change
    add_column :invoice_moderations, :moderation_type, :integer, default: 0
  end
end
