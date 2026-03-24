FactoryBot.define do
  factory :product do
    sequence(:name) { |n| "Product #{n}" }
    description { "Product description" }
    price { 100.0 }
    seller_id { nil }  # Must be set by test
    buyer_id { nil }   # Optional
    status { "available" }
    category_id { nil }  # Optional
    location { "Library" }
    contact { "seller@example.com" }
  end
end
