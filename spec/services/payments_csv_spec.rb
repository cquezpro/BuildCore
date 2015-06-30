describe PaymentsCSV do

  before do
    keys = OpenSSL::PKey::RSA.generate 1024 # smaller == faster
    stub_const "Concerns::RSAPublicKeyEncryptor::KEY", keys.to_pem
  end

  describe "e-mail sent with ::create_and_send!" do

    it "is properly addressed and contains attachment of proper type" do
      expect{
        PaymentsCSV.create_and_send!
      }.to change{ ActionMailer::Base.deliveries.count }.by(1)

      email = ActionMailer::Base.deliveries.last
      expect(email.subject).to start_with("billSync check file")
      expect(email.to).to include("vkbrihma@gmail.com")
      expect(email.attachments.count).to be(1)
      expect(email.attachments[0].content_type).to match(%r{\btext/csv\b})
      expect(email.attachments[0].filename).to end_with(".csv")
    end

  end

  describe "CSV sent with ::create_and_send!" do

    let(:csv_sent){ ActionMailer::Base.deliveries.last.attachments[0].read }

    it "contains proper header row" do
      PaymentsCSV.create_and_send!
      expect(CSV.new(csv_sent).to_a[0]).to eq(PaymentsCSV::HEADER)
    end

    it "consists of rows with info on users whose invoices should be paid" do
      allow_any_instance_of(Invoice).to receive(:set_payment_send_date).and_return(true)
      allow_any_instance_of(Invoice).to receive(:valid_invoice?).and_return(true)
      user = create :user, business_name: "Someone"
      invoice = create :invoice, user: user, status: :payment_queue, payment_send_date: Date.today, amount_due: 123

      PaymentsCSV.create_and_send!
      invoice_row = CSV.new(csv_sent, headers: :first_row).to_a[0]
      expect(invoice_row["Client Number"]).to eq(user.id.to_s)
      expect(invoice_row["Client Name"]).to eq("Someone")
    end

    it "contains decrypted Bank Routing and Bank Account numbers" do
      allow_any_instance_of(Invoice).to receive(:set_payment_send_date).and_return(true)
      allow_any_instance_of(Invoice).to receive(:valid_invoice?).and_return(true)
      user = create :user, routing_number: "011000015", # FED
        bank_account_number: "1111333355551111"
      invoice = create :invoice, user: user, status: :payment_queue, payment_send_date: Date.today, amount_due: 123

      PaymentsCSV.create_and_send!
      invoice_row = CSV.new(csv_sent, headers: :first_row).to_a[0]
      expect(invoice_row["Bank Routing"]).to eq("011000015")
      expect(invoice_row["Bank Account"]).to eq("1111333355551111")
    end

    it "contains bank details" do
      allow_any_instance_of(Invoice).to receive(:set_payment_send_date).and_return(true)
      allow_any_instance_of(Invoice).to receive(:valid_invoice?).and_return(true)
      user = create :user, routing_number: "011000015", # FED
        bank_account_number: "1111333355551111"
      invoice = create :invoice, user: user, status: :payment_queue, payment_send_date: Date.today, amount_due: 123

      PaymentsCSV.create_and_send!
      invoice_row = CSV.new(csv_sent, headers: :first_row).to_a[0]
      expect(invoice_row["Bank Name"]).to eq("FEDERAL RESERVE BANK")
      expect(invoice_row["Bank Address"]).to be_present
      expect(invoice_row["Bank City"]).to be_present
      expect(invoice_row["Bank State"]).to be_present
      expect(invoice_row["Bank Zip"]).to be_present
    end

    it "contains the correct check number" do
      allow_any_instance_of(Invoice).to receive(:set_payment_send_date).and_return(true)
      allow_any_instance_of(Invoice).to receive(:valid_invoice?).and_return(true)
      user = create :user, routing_number: "011000015", # FED
        bank_account_number: "1111333355551111"

      user_two = create :user, routing_number: "011000015", # FED
        bank_account_number: "1111333355551111"

      invoice = create :invoice, user: user, status: :payment_queue, payment_send_date: Date.today, amount_due: 123
      invoice2 = create :invoice, user: user, status: :payment_queue, payment_send_date: Date.today, amount_due: 456
      invoice3 = create :invoice, user: user, status: :payment_queue, payment_send_date: Date.today, amount_due: 456
      invoice4 = create :invoice, user: user_two, status: :payment_queue, payment_send_date: Date.today, amount_due: 456

      klass = PaymentsCSV.create_and_send!
      csv = CSV.new(csv_sent, headers: :first_row)
      invoice_row, invoice_row_two, invoice_row_three, invoice_row_four = csv.to_a

      expect(invoice_row["Check Number"]).to eq("8000000")
      expect(invoice_row_two["Check Number"]).to eq("8000001")
      expect(invoice_row_three["Check Number"]).to eq("8000002")
      expect(invoice_row_four["Check Number"]).to eq("8000000")
      expect(klass.checks).to eq(4)
      expect(klass.total).to eq(123 + 456 * 3)
      expect(user.reload.check_number).to eq(8000003)
      expect(user_two.reload.check_number).to eq(8000001)
    end

  end

end
