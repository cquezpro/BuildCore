module Mturk::Concerns::Normalizer
  extend ActiveSupport::Concern

  included do
    normalize_attribute  :address1, :address2, :zip, with: [:squish, :blank] do |value|
      value.present? && value.is_a?(String) ? value.downcase : value
    end

    normalize_attribute :state, with: [:squish, :blank] do |value|
      value.present? && value.is_a?(String) ? value.upcase : value
    end

    normalize_attribute :city, with: [:squish, :blank] do |value|
      value.present? && value.is_a?(String) ? value.titleize : value
    end

    normalize_attribute :name, with: [:squish, :blank] do |value|
      value.present? && value.is_a?(String) ? value.downcase.titleize : value
    end
  end

end
