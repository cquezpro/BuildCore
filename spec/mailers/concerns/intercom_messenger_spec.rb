describe Concerns::IntercomMessenger do

  around { |example| Sidekiq::Testing.inline! { example.run } }

  before do
    class_double("Intercom::Message").as_stubbed_const
    allow(Intercom::Message).to receive(:create)

    stub_const "ENV", {"INTERCOM_ID_OF_MESSAGE_SENDER" => "12345"}
    stub_const "ExampleMailer", Class.new(ActionMailer::Base)

    ExampleMailer.class_eval do
      include Concerns::IntercomMessenger

      def passing_body_directly
        mail(
          to: "recipient@example.test",
          subject: "Raven",
          body: "Once upon a midnight dreary, while I pondered, weak and weary."
        )
      end

      def rendering_from_template
        mail(
          to: "recipient@example.test",
          subject: "Raven"
        )
      end
    end

    stub_template "anonymous/rendering_from_template.html" =>
      "Over many a quaint and curious volume of forgotten lore"
  end

  it "sends messages via Intercom when body is passed directly" do
    expect(Intercom::Message).to receive(:create) do |hash|
      expect(hash[:subject]).to start_with("Raven")
      expect(hash[:body]).to start_with("Once upon")
      expect(hash[:from]).to eq(type: "admin", id: "12345")
      expect(hash[:to]).to eq(type: "user", email: "recipient@example.test")
    end
    ExampleMailer.passing_body_directly.deliver
  end

  it "sends messages via Intercom when template is rendered" do
    expect(Intercom::Message).to receive(:create) do |hash|
      expect(hash[:subject]).to start_with("Raven")
      expect(hash[:body]).to start_with("Over many")
      expect(hash[:from]).to eq(type: "admin", id: "12345")
      expect(hash[:to]).to eq(type: "user", email: "recipient@example.test")
    end
    ExampleMailer.rendering_from_template.deliver
  end

  it "does not send e-mails via ActionMailer" do
    expect {
      ExampleMailer.passing_body_directly.deliver
    }.not_to change{ ActionMailer::Base.deliveries.count }
  end

  def stub_template hash
    ActionMailer::Base.view_paths.unshift(ActionView::FixtureResolver.new(hash))
  end

end
