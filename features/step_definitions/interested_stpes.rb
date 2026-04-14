Given(/^I have marked the following items as interested:$/) do |table|
  buyer = User.find_by!(email: "1155000002@link.cuhk.edu.hk")
  table.hashes.each do |row|
    product = Product.find_by!(name: row['name'])
    product.update!(status: row['status'])
    Interest.find_or_create_by!(
      item_id: product.id,
      interested_id: buyer.id
    )
  end
end

Given(/^I have no interested items$/) do
  buyer = User.find_by(email: "1155000002@link.cuhk.edu.hk")
  if buyer
    Interest.where(interested_id: buyer.id).destroy_all
    expect(Interest.where(interested_id: buyer.id).count).to eq(0)
  end
  Capybara.reset_sessions!
  step 'I am logged in as "1155000002@link.cuhk.edu.hk"'
end

When(/^I navigate to the interested items page$/) do
  visit "/Account"
  expect(page).to have_content("My Profile", wait: 10)
  find('div', text: /^Interested$/, match: :first).click
  expect(page).not_to have_content("Account Information", wait: 5)
end

When(/^I click on the item card for "([^"]*)"$/) do |product_name|
  expect(page).to have_css('h3', text: product_name, wait: 5)
  find('h3', text: product_name).click
end

Then(/^I should see "([^"]*)" with price "([^"]*)"$/) do |name, price|
  expect(page).to have_content(name, wait: 5)
  expect(page).to have_text(/#{price}/)
end

Then(/^the status for "([^"]*)" should be "([^"]*)"$/) do |name, status|
  card = find('h3', text: name).find(:xpath, '..')
  expect(card).to have_content(/#{status}/i)
end

Then(/^I should be redirected to the product page for "([^"]*)"$/) do |product_name|
  product = Product.find_by!(name: product_name)
  expect(current_path).to eq("/product/#{product.id}")
end