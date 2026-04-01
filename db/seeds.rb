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

#create all categories
categories.each { |name| Category.find_or_create_by!(category_name: name) }

#create an admin user
User.find_or_create_by!(email: '1155000000@link.cuhk.edu.hk') do |user|
  user.id = 100
  user.cuhk_id = '1155000000'
  user.name = 'Admin User'
  user.password = '12345678'
  user.verified_at = Time.now
  user.is_admin = true
end