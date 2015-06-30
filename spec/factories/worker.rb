FactoryGirl.define do
  factory :worker do
    sequence(:mt_worker_id)     {|n| "mt_worker_id_#{n}" }
    training_level              "50"
    score                        5 # Default
    # earnig                       0.0 # Default
    # earning_rate                 0.0 # Default
  end
end
