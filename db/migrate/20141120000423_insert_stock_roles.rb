# Invokes the Rake task in migration because further migrations do rely on
# its completion.
class InsertStockRoles < ActiveRecord::Migration
  def self.up
    Rake::Task['static_records:stock_roles'].invoke
  end

  def self.down
    # NOOP
  end
end
