describe Obfuscator do

  it "obfuscates strings longer than or equal to 9 characters by #-ing them and leaving last 3 characters in cleartext" do
    expect(subject.obfuscate("123456789")).to eq("#" * 6 + "789")
    expect(subject.obfuscate("123456789abcde")).to eq("#" * 11 + "cde")
  end

  it "obfuscates non-empty strings shorter than 9 characters by replacing them with 8 # characters followed by 1 character in cleartext" do
    expect(subject.obfuscate("12345678")).to eq("#" * 8 + "8")
    expect(subject.obfuscate("1")).to        eq("#" * 8 + "1")
  end

  it "does not affect empty strings" do
    expect(subject.obfuscate("")).to eq("")
  end

end
