# features/step_definitions/selling_steps.rb

# --- 1. Data Setup ---
# Create real product records belonging to the current seller
Given(/^I have the following products in my selling list:$/) do |table|
  seller = User.find_by!(email: "1155000001@link.cuhk.edu.hk")
  category = Category.first || Category.create!(category_name: "Electronics")
  
  table.hashes.each do |row|
    Product.create!(
      name: row['name'],
      price: row['price'],
      status: row['status'],
      seller_id: seller.id,
      category_id: category.id,
      condition: "Used",
      location: "Main Campus"
    )
  end
end

Given(/^I have no products listed for sale$/) do
  seller = User.find_by!(email: "1155000001@link.cuhk.edu.hk")
  Product.where(seller_id: seller.id).destroy_all
end

# --- 2. Navigation ---
# Simulate clicking "My Products" tab from the AccountPage sidebar
When(/^I navigate to my selling products page$/) do
  visit "/Account"
  
  expect(page).to have_content("My Profile", wait: 10)
  
  # Click the "My Products" sidebar menu item
  find('div', text: /^My Products$/, match: :first).click
  
  # Wait for React to switch to the MyProduct component
  expect(page).not_to have_content("Account Information", wait: 5)
  expect(page).to have_content("Item Name", wait: 5)
end

# --- 3. Table and Button Operations ---
# Verify content appears in the same table row
Then(/^I should see a table row for "([^"]*)" with price "([^"]*)" and status "([^"]*)"$/) do |name, price, status|
  within('tr', text: name) do
    expect(page).to have_content(price)
    expect(page).to have_content(/#{status}/i)
  end
end

When(/^I click the "([^"]*)" button for "([^"]*)"$/) do |button_text, product_name|
  # Find the table row containing the product name
  row = find('tr', text: product_name, match: :first)
  
  within(row) do
    click_button(button_text)
  end
end

When(/^I click the view icon for "([^"]*)"$/) do |product_name|
  row = find('tr', text: product_name, match: :first)
  within(row) do
    # The ViewButton has no text, only an icon - click the last button in the row
    all('button').last.click
  end
end

When(/^I confirm the deletion dialog$/) do
  within('.swal2-container, .modal-dialog, .modal-content', wait: 5) do
    click_button("Confirm")
  end
  
  # Wait for the dialog to close before proceeding
  expect(page).not_to have_content("Delete Confirmation", wait: 5)
end

# --- 4. Redirect Verification ---
Then(/^I should be redirected to the edit page for "([^"]*)"$/) do |name|
  product = Product.find_by!(name: name)
  expect(current_path).to eq("/edit/#{product.id}")
end

Then(/^I should be redirected to the detail page for "([^"]*)"$/) do |name|
  product = Product.find_by!(name: name)
  expect(current_path).to eq("/product/#{product.id}")
end

Then(/^the product "([^"]*)" should no longer be in the list$/) do |name|
  expect(page).not_to have_content(name)
end