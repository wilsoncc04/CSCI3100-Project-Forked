Given(/^the following categories exist:$/) do |table|
  table.hashes.each do |row|
    Category.find_or_create_by!(category_name: row['name'])
  end
end

Given(/^all categories exist/) do
  categories = [
    "Textbooks & Notes",
    "Electronics & Gadgets",
    "Furniture & Home",
    "Clothing & Accessories",
    "Stationery & Supplies",
    "Snacks & Food",
    "Others"
  ]

  # Ensure data is committed and visible to other connections
  ActiveRecord::Base.connection.execute("SET CONSTRAINTS ALL DEFERRED") if defined?(PG)

  Category.transaction do
    categories.each do |name|
      Category.find_or_create_by!(category_name: name)
    end
  end

  # Optional: force a commit
  ActiveRecord::Base.connection.commit_db_transaction if ActiveRecord::Base.connection.open_transactions > 0
end

Given(/^the following users exist:$/) do |table|
  table.hashes.each do |row|
    User.create!(
      email: row['email'],
      password: row['password'],
      name: row['name'] || "Test User",
      college: row['college'] || "Shaw",
      verified_at: Time.current
    )
  end
end

Given(/^the following products exist:$/) do |table|
  table.hashes.each do |row|
    seller = User.find_by!(email: row['seller'])
    category = Category.find_by!(category_name: row['category'])
    Product.create!(
      name: row['name'],
      price: row['price'],
      category: category,
      seller: seller,
      status: "available",
      condition: "New"
    )
  end
end

# Redundant step removed to avoid ambiguity with interaction_steps.rb
# Given(/^(?:|I )am on the home page$/) do
#   visit '/'
# end

When(/^I hover over "([^"]*)"$/) do |text|
  find('button', text: text).hover
rescue Capybara::ElementNotFound
  # Fallback just in case text is nested or slightly different
  find('div,button', text: text).hover
end

When(/^I click "([^"]*)"$/) do |text|
  click_link_or_button(text, match: :first)

  sleep 0.3
end

When(/^I click Search$/) do
  click_button('Search')
end

Then(/^I should see "([^"]*)"$/) do |text|
  expect(page).to have_content(text)
end

Then(/^I should not see "([^"]*)"$/) do |text|
  expect(page).not_to have_content(text)
end
