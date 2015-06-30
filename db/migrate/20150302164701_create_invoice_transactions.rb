class CreateInvoiceTransactions < ActiveRecord::Migration
  def change
    create_table :invoice_transactions do |t|
      t.integer :line_item_id
      t.integer :invoice_id
      t.decimal :quantity, precision: 8, scale: 2, default: 0.0
      t.decimal :total, precision: 8, scale: 2, default: 0.0
      t.decimal :price, precision: 8, scale: 2, default: 0.0
      t.decimal :discount, precision: 8, scale: 2, default: 0.0
      t.integer :qb_id
      t.integer :sync_token
      t.decimal :average_price, precision: 8, scale: 2, default: 0.0
      t.decimal :average_volume, precision: 8, scale: 2, default: 0.0
      t.string :txn_line_id
      t.integer :order_number
      t.boolean :default_item, default: false
      t.boolean :automatic_calculation, default: false

      t.timestamps
    end

    add_index :invoice_transactions, :line_item_id
    add_index :invoice_transactions, :invoice_id

    add_column :line_items, :vendor_id, :integer
    add_column :line_items, :uniq_item, :boolean, default: false
    add_index :line_items, :vendor_id


    fails = 0
    fails_invoices = 0
    error_invoices = []
    descriptions = []
    Vendor.includes(:invoices).find_each do |vendor|
      string = vendor.invoices.pluck(:id).join(', ')
      next unless string.present?
      items = LineItem.select('DISTINCT ON(line_items.description) line_items.expense_account_id, line_items.id, line_items.invoice_id, line_items.description, line_items.qb_class_id, invoices.date').joins(:invoice).where("invoices.id IN (#{string})").to_a
      vendor.invoices.each do |invoice|
        invoice.line_items.by_user.each do |item|
          next if item.description.nil?
          found_item = items.find {|e| e.description == item.description }
          unless found_item
            fails += 1
            descriptions << item
            next
          end
          a = invoice.invoice_transactions.create(line_item_id: found_item.id,
            total: item.total, discount: item.discount, quantity: item.quantity,
            txn_line_id: item.txn_line_id, order_number: item.order_number,
            price: item.price
          )

          fails_invoices += 1 if a.errors.any?
          error_invoices << a if a.errors.any?
        end
      end
      items.each do |item|
        item.update_column(:vendor_id, vendor.id)
      end
      vendor.line_items.where.not(id: items.collect(&:id)).destroy_all
    end

    # add_index :line_items, [:vendor_id, :description], unique: true

  end
end
