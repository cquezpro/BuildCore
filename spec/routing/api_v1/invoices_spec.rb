describe "routes for invoices" do

  example do
    expect(:get => "api/v1/invoices/500").to route_to(controller: "api/v1/invoices", action: "show", format: :json, id: "500")
  end

  example do
    expect(:get => "api/v1/invoices/500?hit_id=700").to route_to(controller: "api/v1/invoices", action: "show_for_turk", format: :json, hit_id: "700", id: "500")
  end

end
