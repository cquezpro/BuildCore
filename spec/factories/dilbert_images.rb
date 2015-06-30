# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :dilbert_image do
    title "Fresh Dilbert Comic"

    trait :read_image_from_file_fixture do
      transient do
        image_fixture ""
      end
      initialize_with do
        fixture = File.open Rails.root.join "spec", "file_fixtures", image_fixture
        new(attributes.merge image: fixture)
      end
    end
  end

  # Use `create :upload_with_file_fixture, image_fixture: "Composition7_horizontal.jpg"`
  factory :dilbert_image_with_file_fixture, parent: :dilbert_image, traits: [:read_image_from_file_fixture]
end
