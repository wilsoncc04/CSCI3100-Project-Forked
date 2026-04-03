FactoryBot.define do
  factory :notification do
    user { nil }
    actor_id { 1 }
    action { "MyString" }
    target_id { 1 }
    target_type { "MyString" }
    read_at { "2026-04-03 17:45:46" }
  end
end
