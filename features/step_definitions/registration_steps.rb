Given(/^I am on the registration page$/) do
  visit "/register"
end

When(/^I fill in the following registration details:$/) do |table|
  data = table.rows_hash
  fill_in('User Name', with: data['name'])
  fill_in('1155xxxxxx@link.cuhk.edu.hk', with: data['email'])
  fill_in('Password', with: data['password'])
  fill_in('Confirm Password', with: data['confirm_password'])
end

Then(/^I should see the OTP verification popup$/) do
  expect(page).to have_selector('h3', text: 'Verify OTP')
end

When(/^I enter the valid OTP "([^"]*)"$/) do |otp_code|
  fill_in('Enter Token', with: otp_code)
end

Then(/^I should see (?:an error message|the message)? "([^"]*)"$/) do |message|
  expect(page).to have_content(message)
end

Then(/^I should be redirected to the account page$/) do
  expect(current_path).to eq("/Account")
end

Then(/^the OTP popup should not appear$/) do
  expect(page).not_to have_selector('h3', text: 'Verify OTP')
end

Given(/^a user with email "([^"]*)" already exists$/) do |email|
  @mock_existing_user = email
end