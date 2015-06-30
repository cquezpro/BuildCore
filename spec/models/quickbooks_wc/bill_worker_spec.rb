describe QuickbooksWC::BillWorker do
  let(:b_worker) { QuickbooksWC::BillWorker.new }
  let(:user) { create(:user, synced_qb: true) }

  describe "Queriying" do
    let(:invoices_with_txn_id) { create_list(:invoice, 3, user: user)}
    let(:invoices_without_id) { create_list(:invoice, 2, user: user, txn_id: nil)}
    let(:fake_response) {
      invoices_with_txn_id.collect {|i| {"bill_ret" => { "txn_id" => i.txn_id, "edit_sequence" => "hue" } } }
    }


    describe "#" do
      before(:each) do
        b_worker.handle_response(fake_response, nil, {}, {}, user.uniq_business_name)
      end
      it "sets invoices to sync" do
        invoices_without_id.each do |invoice|
          expect(invoice.sync_qb).to eq(false)
        end
      end

      it "saves the txn_id and sets the edit sequence " do
        invoices_with_txn_id.each do |invoice|
          invoice.reload
          expect(invoice.edit_sequence).to eq("hue")
        end
      end

    end
  end

  describe "Payment" do
    let!(:invoice) { create(:invoice, user: user)}
    let(:fake_response) {
      {
        "bill_payment_check_ret" => {
          "txn_id" => invoice.txn_id,
          "txn_number" => 12345
        },
        "xml_attributes" => {"requestID" => invoice.id, 'statusCode' => '0' }
      }
    }

    it "pays the bill" do
      expect(invoice.sync_qb).to eq(false)
      invoice.wire_sent!
      invoice.update_column(:sync_qb, true)
      b_worker.handle_response(fake_response, nil, {}, {}, user.uniq_business_name)
      invoice.reload
      expect(invoice.bill_paid).to eq(true)
      expect(invoice.txn_number).to eq(12345)
      expect(invoice.sync_qb).to eq(false)

    end
  end

  describe "Upading" do
    let!(:invoice) { create(:invoice, user: user, txn_id: nil)}
    let(:fake_response) {
      { "xml_attributes"=>{"requestID"=>invoice.id, "statusCode"=>"0", "statusSeverity"=>"Info", "statusMessage"=>"Status OK"},
       "bill_ret"=>{"xml_attributes"=>{}, "txn_id"=>"C3-1423744825",
       "time_created"=>"2015-02-12T12:40:25+00:00", "time_modified"=>"2015-02-12T12:40:25+00:00",
       "edit_sequence"=>"1423744825", "txn_number"=>45,
       "vendor_ref"=>{"xml_attributes"=>{}, "list_id"=>"8000001E-1423742846",
       "full_name"=>"So Here Is A Newest Vendor Le- billSync"},
       "ap_account_ref"=>{"xml_attributes"=>{}, "list_id"=>"80000036-1423596416",
       "full_name"=>"A new AP account"}, "txn_date"=>"2015-02-12",
       "due_date"=>"2015-02-26", "amount_due"=>202.02, "memo"=>"via web app - billSync",
       "is_paid"=>false, "expense_line_ret"=>[{"xml_attributes"=>{},
       "txn_line_id"=>"C5-1423744825", "account_ref"=>{"xml_attributes"=>{},
       "list_id"=>"80000028-1423596394", "full_name"=>"1"}, "amount"=>202.02,
       "memo"=>"Un accounted for line items"}, {"xml_attributes"=>{},
       "txn_line_id"=>"C6-1423744825", "account_ref"=>{"xml_attributes"=>{},
       "list_id"=>"80000028-1423596394", "full_name"=>"1"}, "amount"=>0.0,
       "memo"=>"No description provided"}], "open_amount"=>4444.44}
      }
    }

    it "should update the txn id of the invoice" do
      b_worker.handle_response(fake_response, nil, {}, {}, user.uniq_business_name)
      invoice.reload
      expect(invoice.txn_id).to eq("C3-1423744825")
    end
  end

end

