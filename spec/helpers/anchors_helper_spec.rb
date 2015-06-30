describe AnchorsHelper do

  subject { Object.new.tap { |o| o.extend described_class } }

  let(:invoice) { build_stubbed :invoice }

  example "#invoice_anchor" do
    expect(subject.invoice_anchor(invoice)).to eq("/invoice/#{invoice.id}/edit/")
  end

end
