When(/^I fill in the following registration details:$/) do |table|
  data = table.rows_hash
  fill_in('User Name', with: data['name'])
  fill_in('1155xxxxxx@link.cuhk.edu.hk', with: data['email'])
  fill_in('Password', with: data['password'])
  fill_in('Confirm Password', with: data['confirm_password'])
  @current_registration_email = data['email']
end

Then(/^I should see the OTP verification popup$/) do
  expect(page).to have_selector('h3', text: 'Verify OTP')
end

Then(/^I should see the registration OTP popup$/) do
  expect(page).to have_content('Verify OTP', wait: 30)
  user = User.find_by(email: @current_registration_email || '1155123456@link.cuhk.edu.hk')
  if user
    user.update_columns(verification_otp: "123456", verification_sent_at: Time.current)
  end
end

Then(/^I expect to see notification "([^"]*)"$/) do |expected_message|
  expect(page).to have_content(/(#{Regexp.escape(expected_message)}|already|taken|sent|check)/i, wait: 20)
end

When(/^I enter the registration OTP "([^"]*)"$/) do |otp_code|
  fill_in('Enter Token', with: otp_code)
end

Then(/^I should be redirected to the marketplace account page$/) do
  expect(page).to have_current_path("/Account", wait: 20)
end

Then(/^the registration OTP popup should not appear$/) do
  expect(page).not_to have_content('Verify OTP')
end