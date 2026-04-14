When(/^I select "([^"]*)" from "([^"]*)"$/) do |option, dropdown_name|
  select(option, from: dropdown_name)
end

Then(/^the account "([^"]*)" should have college "([^"]*)" and hostel "([^"]*)"$/) do |email, college, hostel|
  user = User.find_by!(email: email)
  expect(user.college).to eq(college)
  expect(user.hostel).to eq(hostel)
end

Then(/^the profile should still be in edit mode$/) do
  expect(page).to have_button("Cancel")
  expect(page).to have_selector('select', visible: true)
end