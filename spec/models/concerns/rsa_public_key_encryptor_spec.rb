describe Concerns::RSAPublicKeyEncryptor do

  let(:keys) do
    OpenSSL::PKey::RSA.generate 1024 # smaller == faster
  end

  before do
    stub_const "Concerns::RSAPublicKeyEncryptor::KEY", keys.public_key.to_pem

    # Struct provides nice [] access as in AR
    stub_const "ExampleModel", Struct.new(:some_attr, :encrypted_some_attr)

    ExampleModel.class_eval do
      include ActiveModel::Serialization
      include Concerns::RSAPublicKeyEncryptor

      # All the struct attributes
      def attributes
        attr_names = self.class.members
        attribute_hash = Hash[*attr_names.map{ |a| [a, nil]}.flatten]
        attribute_hash.with_indifferent_access
      end
    end
  end

  it "encrypts the attribute" do
    ExampleModel.encrypt :some_attr
    obj = ExampleModel.new
    obj.some_attr = "black cat"
    encrypted = obj.encrypted_some_attr
    expect(encrypted).not_to eq("black cat")
    decrypted = OpenSSL::PKey::RSA.new(keys).private_decrypt encrypted
    expect(decrypted).to eq("black cat")
  end

  it "allows assigning nil to the attribute and skips encryption then" do
    ExampleModel.encrypt :some_attr
    obj = ExampleModel.new
    obj.some_attr = nil
    encrypted = obj.encrypted_some_attr
    expect(encrypted).to be(nil)
  end

  it "disallows setting the encrypted attribute directly" do
    ExampleModel.encrypt :some_attr
    obj = ExampleModel.new
    expect(obj).not_to receive(:"[]=")
    expect{
      obj.encrypted_some_attr = "black cat"
    }.to raise_exception Concerns::RSAPublicKeyEncryptor::DirectAssignmentError
  end

  it "obfuscates encrypted attribute with indicated method when obfuscate_with option is present and is a Proc" do
    ExampleModel.encrypt :some_attr, obfuscate_with: lambda{ |v| v.reverse }
    obj = ExampleModel.new
    obj.some_attr = "black cat"
    expect(obj.some_attr).to eq("black cat".reverse)
  end

  it "obfuscates encrypted attribute with ### when obfuscate_with option is not present" do
    ExampleModel.encrypt :some_attr
    obj = ExampleModel.new
    obj.some_attr = "black cat"
    expect(obj.some_attr).to eq("###")
  end

  it "does not obfuscate nil" do
    ExampleModel.encrypt :some_attr
    obj = ExampleModel.new
    obj.some_attr = nil
    expect(obj.some_attr).to be(nil)
  end

  it "protects attribute from overwriting with obfuscated value" do
    ExampleModel.encrypt :some_attr, obfuscate_with: lambda{ |v| v.upcase }
    obj = ExampleModel.new
    obj.some_attr = "black cat"
      obj.some_attr = "BLACK CAT" # should have no effect
    encrypted = obj.encrypted_some_attr
    decrypted = OpenSSL::PKey::RSA.new(keys).private_decrypt encrypted
    expect(decrypted).to eq("black cat")
  end

  it "prevents encrypted attribute from showing up in JSON" do
    ExampleModel.encrypt :some_attr
    obj = ExampleModel.new
    obj.some_attr = "black cat"
    expect(obj.serializable_hash).to include "some_attr"
    expect(obj.serializable_hash).not_to include "encrypted_some_attr"
  end

  it "allows nil as an argument for #serializable_hash" do
    ExampleModel.encrypt :some_attr
    obj = ExampleModel.new
    obj.some_attr = "black cat"
    expect{ obj.serializable_hash(nil) }.not_to raise_exception
  end

end
