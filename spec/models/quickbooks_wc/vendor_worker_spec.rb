describe QuickbooksWC::VendorWorker do
  let(:b_worker) { QuickbooksWC::VendorWorker.new }
  let(:user) { create(:user, synced_qb: true) }
  let(:vendor) { create(:vendor, user: user)}

  it { expect(vendor.sync_qb).to eq(true)}

  describe "Sync" do
    describe "on success" do
      let(:fake_response) {
        { "xml_attributes"=>{"requestID"=>vendor.id, "statusCode"=>"0", "statusSeverity"=>"Info", "statusMessage"=>"Status OK"},
         "vendor_ret"=>{"xml_attributes"=>{}, "list_id"=>"8000001E-1423742846",
         "full_name"=> vendor.qb_d_name }
        }
      }

      it "should update the qb id of the vendor" do
        b_worker.handle_response(fake_response, nil, {}, {}, user.uniq_business_name)
        vendor.reload
        expect(vendor.qb_d_id).to eq("8000001E-1423742846")
      end
    end

    describe "wrong edit sequence" do
      let(:fake_response) {
        { "xml_attributes"=>{"requestID"=>vendor.id, "statusCode"=>"3200", "statusSeverity"=>"Info", "statusMessage"=>"Status OK"},
         "vendor_ret"=>{"xml_attributes"=>{}, "list_id"=>"8000001E-1423742846",
         "full_name"=> vendor.qb_d_name, "edit_sequence" => "Dummy sequence" }
        }
      }

      it "should update the edit sequence of the vendor" do
        b_worker.handle_response(fake_response, nil, {}, {}, user.uniq_business_name)
        vendor.reload
        expect(vendor.edit_sequence).to eq("Dummy sequence")
      end
    end
  end

end

