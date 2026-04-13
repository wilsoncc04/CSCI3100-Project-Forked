Given(/^I am logged in as "([^"]*)" with password "([^"]*)"$/) do |email, password|

  user = User.find_by(email: email) || FactoryBot.create(:user, email: email, password: password, verified_at: Time.current)

  visit '/login'

  find('input[type="email"]').set(email)
  find('input[type="password"]').set(password)

  accept_alert do
    click_button('Login')
  end

#  expect(page).to have_current_path('/Account', wait: 5)
end

def visit_product_details_page(product_name)
  product = Product.find_by!(name: product_name)
  visit "/product/#{product.id}"
  expect(page).to have_content('Product Details')
end

Given(/^I open the product details page for "([^"]*)"$/) do |product_name|
  visit_product_details_page(product_name)
end

Then(/^the "([^"]*)" button should be disabled$/) do |button_text|
  expect(page).to have_css('button:disabled', text: button_text)
end

Then(/^the "([^"]*)" button should not appear$/) do |button_text|
  expect(page).to have_no_button(button_text)
end
