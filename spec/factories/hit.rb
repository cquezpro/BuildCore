FactoryGirl.define do
  factory :hit do
    sequence(:mt_hit_id)        {|n| "mt_hit_id_#{n}" }
    hit_type :first_review

    trait :with_assignments do
      after(:create) do |transaction|
        transaction << create(:assignment)
      end
    end

    # Yeah, against orthography, but that's how the column is named.
    trait :submited do
      submited true
    end

    # Trait for every hit_type.
    Hit.hit_types.keys.map(&:to_sym).each do |hit_type_name|
      trait hit_type_name do
        hit_type hit_type_name
      end
    end
  end
end
