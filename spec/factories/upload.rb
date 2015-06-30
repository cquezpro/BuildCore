# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :upload do
  end

  # Use `create :upload, :with_file_fixture, image_fixture: "Composition7_horizontal.jpg"`
  trait :with_file_fixture do
    transient do
      image_fixture ""
    end
    initialize_with do
      fixture = File.open Rails.root.join "spec", "file_fixtures", image_fixture
      new(attributes.merge image: fixture)
    end
  end
end
