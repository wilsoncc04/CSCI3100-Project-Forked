When(/^I open the login page$/) do
  visit "/login"
end

When(/^I open the forgot password panel$/) do
  click_button("Forgot password?")
  expect(page).to have_content("Reset Password")
end

When(/^I request a reset OTP for "([^"]*)"$/) do |email|
  all('input[placeholder="1155xxxxxx@link.cuhk.edu.hk"]')[1].set(email)
  click_button("Send Reset OTP")
end

Then(/^I should see the password reset request confirmation$/) do
  expect(page).to have_content("If this account is eligible, an OTP has been sent to your inbox.")
end

Given(/^a password reset OTP "([^"]*)" is set for "([^"]*)"$/) do |otp, email|
  user = User.find_by!(email: email)
  user.update!(
    verified_at: Time.current,
    verification_otp: otp,
    verification_sent_at: Time.current
  )
end

When(/^I submit a new password "([^"]*)" with otp "([^"]*)" for "([^"]*)"$/) do |new_password, otp, email|
  all('input[placeholder="1155xxxxxx@link.cuhk.edu.hk"]')[1].set(email)
  find('input[placeholder="Enter OTP from email"]').set(otp)
  find('input[placeholder="Enter new password"]').set(new_password)
  find('input[placeholder="Confirm new password"]').set(new_password)
  click_button("Reset Password")
end

Then(/^the account "([^"]*)" should authenticate with "([^"]*)"$/) do |email, password|
  user = User.find_by!(email: email)
  expect(user.authenticate(password)).to be_truthy
end

When(/^I submit mismatched passwords for "([^"]*)" with otp "([^"]*)"$/) do |email, otp|
  all('input[placeholder="1155xxxxxx@link.cuhk.edu.hk"]')[1].set(email)
  find('input[placeholder="Enter OTP from email"]').set(otp)
  find('input[placeholder="Enter new password"]').set("passwordA123!")
  find('input[placeholder="Confirm new password"]').set("passwordB456!")
  click_button("Reset Password")
end

# --- Change Password from Account Page steps ---

When(/^I click the "([^"]*)" sidebar tab$/) do |tab_name|
  find('div', text: /^#{Regexp.escape(tab_name)}$/, match: :first).click
  sleep 1
end

When(/^I fill in the current password with "([^"]*)"$/) do |password|
  find('input[placeholder="Current Password"]').set(password)
end

When(/^I fill in the new password fields with "([^"]*)"$/) do |password|
  find('input[placeholder="New Password"]').set(password)
  find('input[placeholder="Confirm New Password"]').set(password)
end

When(/^I fill in mismatched new passwords$/) do
  find('input[placeholder="New Password"]').set("passwordA123!")
  find('input[placeholder="Confirm New Password"]').set("passwordB456!")
end
