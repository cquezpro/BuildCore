module AuthenticateInRequestsHelper

  def as someone
    before(:example) do
      someone_object = public_send someone

      allow_any_instance_of(Api::V1::CoreController)
        .to receive(:authenticate_individual!).and_return(true)
      allow_any_instance_of(Api::V1::CoreController)
        .to receive(:current_individual).and_return(someone_object)
    end
  end

end

RSpec.configure do |c|
  c.extend AuthenticateInRequestsHelper, type: :request
end
