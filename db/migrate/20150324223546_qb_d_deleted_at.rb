class QBDDeletedAt < ActiveRecord::Migration
  def change
    add_column :invoices, :qb_d_deleted_at, :datetime
  end
end
