RSpec.describe PDFCreator do

  let(:receiver){ PDFCreator.new }
  let(:allowed_source_mimes){ %w[application/pdf application/postscript] }

  describe "#tempdir" do
    it "is autocreated" do
      retval = subject.send :tempdir
      expect(retval).to be_present
      expect(retval).to satisfy{ |v| File.exists? v }
    end

    it "is cached" do
      retval1, retval2 = 2.times.map{ subject.send :tempdir }
      expect(retval1).to eq(retval2)
    end
  end

  describe "#parts" do
    subject{ receiver.parts }
    it { is_expected.to be_kind_of Array }
  end

  describe "#append_upload" do
    subject{ receiver.method :append_upload }
    let(:upload){ create :upload, :with_file_fixture, image_fixture: fixture }

    before do
      allow(receiver).to receive(:prepare_image).and_return("pdf/from/image")
    end

    context "when PDF upload is passed" do
      let(:fixture){ "two_pages.pdf" }

      it "caches upload in tempdir" do
        expect{
          subject.(upload)
        }.to change{ Dir.entries(receiver.send :tempdir).count }.by(1)
      end
      it "appends resulting PDF to list of files" do
        old_parts = receiver.parts.dup
        expect{ subject.(upload) }.to change{ receiver.parts.count }.by(1)
        expect(receiver.parts[0..-2]).to eq(old_parts)
        appended = receiver.parts.last
        expect(mime_type_of appended).to be_in(allowed_source_mimes)
      end
    end

    context "when picture upload is passed" do
      let(:fixture){ "Composition7_vertical.jpg" }

      it "caches upload in tempdir" do
        expect{
          subject.(upload)
        }.to change{ Dir.entries(receiver.send :tempdir).count }.by(1)
      end
      it "processes picture upload with #prepare_image" do
        expect(receiver).to receive(:prepare_image)
        subject.(upload)
      end
      it "appends resulting PDF to list of files" do
        old_parts = receiver.parts.dup
        expect{ subject.(upload) }.to change{ receiver.parts.count }.by(1)
        expect(receiver.parts[0..-2]).to eq(old_parts)
        appended = receiver.parts.last
        expect(appended).to eq("pdf/from/image")
      end
    end
  end

  describe "#append_text" do
    subject{ receiver.method :append_text }
    let(:text){ "Text to process" }

    before do
      allow(receiver).to receive(:prepare_text).and_return("ps/from/text")
    end

    it "generates PS from UTF-8 text using #prepare_text" do
      expect(receiver).to receive(:prepare_text).with(text)
      subject.(text)
    end
    it "appends generated PS to list of files" do
      old_parts = receiver.parts.dup
      expect{ subject.(text) }.to change{ receiver.parts.count }.by(1)
      expect(receiver.parts[0..-2]).to eq(old_parts)
      appended = receiver.parts.last
      expect(appended).to eq("ps/from/text")
    end
  end

  describe "#prepare_image" do
    subject{ receiver.method :prepare_image }
    let(:vertical){ file_fixture_copy "Composition7_vertical.jpg" }
    let(:horizontal){ file_fixture_copy "Composition7_horizontal.jpg" }

    it "converts picture to PDF and returns path to converted file" do
      retval = subject.(vertical)
      expect(retval).to be_present
      expect(retval).to satisfy{ |v| File.exists? v }
      expect(mime_type_of retval).to be_in(allowed_source_mimes)
    end
    it "rotates horizontal picture with ImageMagick prior to conversion" do
      expect_any_instance_of(MiniMagick::Image).to receive(:rotate)
      subject.(horizontal)
    end
    it "does not rotate vertical picture" do
      expect_any_instance_of(MiniMagick::Image).not_to receive(:rotate)
      subject.(vertical)
    end
  end

  describe "#prepare_text" do
    subject{ receiver.method :prepare_text }

    it "converts text to PS using Paps and returns path to this file" do
      retval = subject.("Some text")
      expect(retval).to be_present
      expect(retval).to satisfy{ |v| File.exists? v }
      expect(mime_type_of retval).to be_in(allowed_source_mimes)
    end
  end

  describe "#merge" do
    subject{ receiver.method :merge }
    let(:target){ Tempfile.new ["target", ".pdf"] }

    before do
      parts = 2.times.map do
        file_fixture_copy "two_pages.pdf", receiver.send(:tempdir)
      end
      allow(receiver).to receive(:parts).and_return(parts)
    end

    it "generates resulting PDF from list of files using GhostScript" do
      subject.(target.path)
      expect(mime_type_of target.path).to eq("application/pdf")
      img = MiniMagick::Image.new(target.path)
      expect(img.pages.count).to eq(4)
    end
    it "normalizes all pages to A4"
  end

  describe "#cleanup" do
    subject{ receiver.method :cleanup }

    it "removes tempdir along with its contents" do
      expect(FileUtils).to receive(:rm_r).with(receiver.send :tempdir)
      subject.()
    end
    it "empties list of parts" do
      allow(receiver).to receive(:parts).and_return([:one, :two])
      expect{ subject.() }.to change{ receiver.parts.size }.from(2).to(0)
    end
  end

  describe "#finalize" do
    it "performs cleanup" do
      expect(subject).to receive(:cleanup)
      subject.finalize
    end
  end

  describe "::create" do
    subject{ described_class.method(:create) }

    let(:creator_dbl){ instance_double("PDFCreator") }
    let(:invoice){ build_stubbed :invoice }
    let(:uploads){ 2.times.map{ build_stubbed :upload } }

    before do
      allow(PDFCreator).to receive(:new).and_return(creator_dbl)
      allow(creator_dbl).to receive(:merge)
      allow(creator_dbl).to receive(:cleanup)
      allow(creator_dbl).to receive(:append_upload)
      allow(creator_dbl).to receive(:append_text)
    end

    it "instantiates PDFCreator to works with it" do
      expect(PDFCreator).to receive(:new)
      subject.(uploads, invoice)
    end
    it "appends all the passed uploads to PDFCreator" do
      expect(creator_dbl).to receive(:append_upload).twice
      subject.(uploads, invoice)
    end
    it "appends invoice e-mail body when it's present" do
      expect(creator_dbl).to receive(:append_text).with("The Text")
      subject.(uploads, build_stubbed(:invoice, email_body: "The Text"))
    end
    it "does not append invoice body when it's blank" do
      expect(creator_dbl).not_to receive(:append_text)
      subject.(uploads, build_stubbed(:invoice, email_body: " "))
    end
    it "does not append invoice body when invoice is missing" do
      expect(creator_dbl).not_to receive(:append_text)
      subject.(uploads, nil)
    end
    it "merges the resulting PDF" do
      expect(creator_dbl).to receive(:merge)
      subject.(uploads, invoice)
    end
    it "performs cleanup" do
      expect(creator_dbl).to receive(:cleanup)
      subject.(uploads, invoice)
    end
    it "saves PDF in /public/temp and returns path to it" do
      retval = subject.(uploads, invoice)
      expect(retval).to be_kind_of(Pathname)
      expect(retval.each_filename.to_a[-3..-2]).to eq(%w[public temp])
      expect(retval.extname).to eq(".pdf")
    end
  end

  example "Creating PDF from horizontal picture, two page PDF and text" do
    fixture_file_names = %w[two_pages.pdf Composition7_horizontal.jpg]
    uploads = fixture_file_names.map do |fname|
      create :upload, :with_file_fixture, image_fixture: fname
    end
    invoice = build_stubbed :invoice, email_body: "Hi! Regards, Me."
    out = PDFCreator.create uploads, invoice
    img = MiniMagick::Image.new(out)
    expect(img.pages.count).to eq(4)
  end

  def mime_type_of file_path
    MimeMagic.by_magic(File.open file_path).type
  end

  # Instantiate temporary copy of given file fixture to prevent it
  # from accidental changes.
  def file_fixture_copy file_name, directory = Dir.tmpdir
    original = Rails.root.join "spec", "file_fixtures", file_name
    tempfile = Tempfile.new(file_name, directory)
    # Prevent GC from deleting tempfile in the middle of spec
    (@keep_tempfiles ||= []) << tempfile
    FileUtils.copy original, tempfile.path
    tempfile.path
  end

end
