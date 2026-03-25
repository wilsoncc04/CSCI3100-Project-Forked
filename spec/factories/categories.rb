FactoryBot.define do
  factory :category do
    sequence(:category_name) { |n| "Category #{n}" }
  end
end
