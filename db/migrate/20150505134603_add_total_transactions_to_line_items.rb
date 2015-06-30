class AddTotalTransactionsToLineItems < ActiveRecord::Migration

  def self.up

    add_column :line_items, :total_transactions, :decimal, :null => false, :default => 0

  end

  def self.down

    remove_column :line_items, :total_transactions

  end

end
