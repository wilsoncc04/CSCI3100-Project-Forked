
Given('I am logged in as a seller') do
  @seller = User.find_by(email: "1155777777@link.cuhk.edu.hk") ||
            User.create!(
              email: "1155777777@link.cuhk.edu.hk",
              password: "password123",
              name: "Active Seller",
              college: "Shaw",
              verified_at: Time.current
            )
  visit '/login'
  fill_in('1155xxxxxx@link.cuhk.edu.hk', with: @seller.email, match: :first)
  fill_in('Enter your password', with: 'password123')
  click_button('Login')
  
  expect(page).to have_current_path('/Account', wait: 5)
end

When('I attach an image to the dropzone') do
  image_path = Rails.root.join('spec/fixtures/files/test_image.jpg')
  
  FileUtils.mkdir_p(File.dirname(image_path))
  File.open(image_path, 'wb') { |f| f.write('fake image content') } unless File.exist?(image_path)
  
  find('input[type="file"]', visible: :all).attach_file(image_path)
end

Then('I should see the image preview box') do
  expect(page).to have_css('img', wait: 5)
end

Then('I should see the {string} text area appear') do |text|
  expect(page).to have_content(text)
  expect(page).to have_css('textarea', wait: 5)
end

When('I click the {string} button without filling the advertisement') do |btn_text|
  click_button(btn_text)
end

Then('the form should not submit') do
  expect(page).to have_current_path('/sell', ignore_query: true)
end

Then(/^I should see a validation error "([^"]*)"$/) do |expected_msg|
  field_id = 'community_description'
  expect(page).to have_selector("##{field_id}", wait: 5)

  actual_msg = page.evaluate_script("document.getElementById('#{field_id}').validationMessage")

  expect(actual_msg).to eq(expected_msg)

  is_invalid = page.evaluate_script("document.getElementById('#{field_id}').checkValidity() == false")
  expect(is_invalid).to be true
end

Given('I have an active listing named {string}') do |product_name|
  category = Category.first || Category.create!(category_name: "Others")
  @product = Product.create!(
    name: product_name,
    price: 100,
    category: category,
    seller: @seller, 
    status: "available",
    condition: "Brand New",
    description: "A test product for editing",
    location: "CUHK",
    contact: "test@link.cuhk.edu.hk"
  )
end

When('I am on the edit page for {string}') do |product_name|
  product = Product.find_by!(name: product_name)
  visit "/edit/#{product.id}"
end

Then('I should see the title {string}') do |title_text|
  expect(page).to have_content(title_text)
end

Then('the {string} field should contain {string}') do |field_name, expected_value|
  expect(page).to have_field(field_name, with: expected_value)
end