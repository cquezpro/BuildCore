describe Permission do

  describe "::RAW" do
    it "is a Set of Arrays" do
      expect(Permission::RAW).to be_kind_of(Set)
      expect(Permission::RAW).to all(be_kind_of(Array))
    end
  end


  describe "::ALL" do
    it "is a Hash which keys are Strings and values are Permissions" do
      expect(Permission::ALL).to be_kind_of(Hash)
      expect(Permission::ALL.keys).to all(be_kind_of(String))
      expect(Permission::ALL.values).to all(be_kind_of(Permission))
    end
  end


  describe "::new" do
    before{  stub_const "SubjectStr", Class.new }

    it "is not public" do
      expect(Permission.public_methods).not_to include(:new)
    end

    it "allows symbols as actions" do
      perm = Permission.send :new, :action_str, :subject_str
      expect(perm.action).to be(:action_str)
    end

    it "allows symbols as subjects" do
      perm = Permission.send :new, :action_str, :subject_str
      expect(perm.subject).to be(:subject_str)
    end

    it "allows classes as subjects" do
      perm = Permission.send :new, :action_str, SubjectStr
      expect(perm.subject).to be(SubjectStr)
    end
  end


  describe "::[]" do
    it "returns Permission associated with given description Array" do
      stub_const "Permission::ALL", {%w[action subject] => :permission}
      expect(Permission[%w[action subject]]).to be(:permission)
      expect(Permission[%w[action another]]).to be(nil)
    end
  end

end
