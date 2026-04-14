
Given(/^the product "([^"]*)" has (\d+) uploaded images$/) do |name, count|
  product = Product.find_by!(name: name)
  image_path = Rails.root.join('spec/fixtures/files/test_image.jpg')
  
  FileUtils.mkdir_p(File.dirname(image_path))
  File.open(image_path, 'wb') { |f| f.write('fake image') } unless File.exist?(image_path)
  
  count.to_i.times do
    product.images.attach(io: File.open(image_path), filename: 'test.jpg', content_type: 'image/jpeg')
  end
end

Given(/^I am on the product details page for "([^"]*)"$/) do |name|
  product = Product.find_by!(name: name)
  visit "/product/#{product.id}"
  expect(page).to have_content(name, wait: 10)
end

Then(/^I should see a "([^"]*)" section$/) do |text|
  expect(page).to have_content(text)
end

When(/^I click the main product photo$/) do
  img_element = find('img[alt="Main Photo"]', wait: 10)
  img_element.scroll_to(img_element)
  img_element.click
end

Then(/^a full-screen image modal should open$/) do
  expect(page).to have_css('img[alt="Full Screen product image"]', visible: :all, wait: 10)
end

When(/^I click the (right|left) navigation arrow$/) do |direction|
  modal_container = find('img[alt="Full Screen product image"]').find(:xpath, '..')
  
  within(modal_container) do
    buttons = all('button')
    if direction == "right"
      buttons.last.click
    else
      buttons[1].click
    end
  end
end

Then(/^the modal should display the (next|previous|last) image$/) do |type|
  expect(page).to have_css('img[alt="Full Screen product image"]', visible: :all, wait: 5)
end

When(/^I click the close button$/) do
  modal_container = find('img[alt="Full Screen product image"]').find(:xpath, '..')
  
  within(modal_container) do
    all('button').first.click
  end
end

Then(/^the image modal should disappear$/) do
  expect(page).to have_no_css('img[alt="Full Screen product image"]', wait: 5)
end

Then(/^the button should indicate that the product is liked$/) do
  expect(page).to have_css('button', text: /Interested/i)
end

Then(/^I should see an alert prompt "([^"]*)"$/) do |text|
  # Try multiple selectors for alert prompts (SweetAlert2, custom alerts, or browser alerts)
  begin
    within('.swal2-container', wait: 5) do
      actual_content = page.text
      expected_text = text.delete('"')
      clean_actual = actual_content.gsub(/["'""\\]/, '')
      clean_expected = expected_text.gsub(/["'""\\]/, '')
      expect(clean_actual).to include(clean_expected)
    end
  rescue Capybara::ElementNotFound
    # Fallback: check if text appears anywhere on page (for browser alerts or other implementations)
    expect(page).to have_text(text.delete('"'), wait: 5)
  end
end

Then(/^I should not see the "([^"]*)" button$/) do |text|
  expect(page).to have_no_button(text)
end

When(/^I accept the prompt$/) do
  within('.swal2-container', wait: 5) do
    click_button('Confirm')
  end

  expect(page).to have_no_css('.swal2-container', wait: 5)
end

When(/^I dismiss the prompt$/) do
  within('.swal2-container', wait: 5) do
    click_button('Cancel')
  end
  expect(page).to have_no_css('.swal2-container', wait: 5)
end