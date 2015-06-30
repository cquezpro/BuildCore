class AddMarkedAsPaidToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :marked_as_paid, :boolean, default: false

    Invoice.archived.each do |i|
      next unless i.send :ready_to_sync?
      i.update_column(:marked_as_paid, true)
    end
  end
end
