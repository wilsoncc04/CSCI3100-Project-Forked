FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "1155#{format('%06d', n)}@link.cuhk.edu.hk"}
    sequence(:cuhk_id) { |n| "1155#{format('%06d', n)}" }
    sequence(:name) { |n| "User #{n}" }
    college { ["Chung Chi College", "New Asia College", 
    "United College", "Shaw College", "Morningside College", 
    "S.H. Ho College", "C.W. Chu College", "Wu Yee Sun College", 
    "Lee Woo Sing College"].sample }
    hostel { ["On-campus", "Off-campus"].sample }
    is_seller { [true, false].sample }
    password { "SecurePassword123" }
  end
end
