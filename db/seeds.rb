# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
categories = [
  "Textbooks & Notes",
  "Electronics & Gadgets",
  "Furniture & Home",
  "Clothing & Accessories",
  "Stationery & Supplies",
  "Snacks & Food",
  "Others"
]

# create all categories
categories.each { |name| Category.find_or_create_by!(category_name: name) }

# create an admin user
User.find_or_create_by!(email: '1155000000@link.cuhk.edu.hk') do |user|
  user.id = 100
  user.cuhk_id = '1155000000'
  user.name = 'Admin User'
  user.password = '12345678'
  user.verified_at = Time.now
  user.is_admin = true
end

1.times do |i|
  student_id = "115500000#{i+5}"
  User.find_or_create_by!(cuhk_id: student_id) do |user|
    user.name = "Student #{i}"
    user.email = "#{student_id}@link.cuhk.edu.hk"
    user.password = "password123"
    user.verified_at = Time.current
    user.is_admin = false
  end
end

users = User.all.to_a

puts "--- Step 3: Seeding Products ---"
40.times do |i|
  category = categories.sample
  seller = users.sample
  base_price = rand(20..800)

  begin
    product = Product.create!(
      name: "#{category} - Item #{i}",
      description: "Good condition, used in #{category} courses. Pickup at University Station.",
      price: base_price,
      seller_id: seller.id,
      category_id: Category.find_by(category_name: category).id,
      condition: [ "Brand New", "Like New", "Used - Good", "Heavily Used" ].sample,
      status: [ "available", "reserved", "available" ].sample,
      contact: "WhatsApp: 6#{rand(1000000..9999999)}",
      location: "CUHK Campus"
    )

    # 動機：建立歷史價格點
    [ 1, 3, 5 ].sample(rand(2..3)).each do |days_ago|
      product.price_histories.create!(
        price: base_price + rand(-50..50),
        date: Time.current - days_ago.days
      )
    end
  rescue ActiveRecord::RecordInvalid => e
    # 動機：如果產品建立失敗，把真實的錯誤印出來，而不是默默忽略
    puts "  [Error] Failed to create product #{i}: #{e.message}"
  end
end
