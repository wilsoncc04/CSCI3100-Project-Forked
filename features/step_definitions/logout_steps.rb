Then(/^I should be redirected to the login page$/) do
  expect(page).to have_current_path('/login', wait: 10)
end

Then(/^I should be redirected to the home page$/) do
  expect(page).to have_current_path('/', wait: 15)
end

When(/^I click on the "([^"]*)" dropdown link$/) do |link_text|
  btn = find('button', text: link_text, visible: :all, match: :first)
  page.execute_script("arguments[0].click();", btn.native)
  sleep 1 
end

When(/^I click "Confirm" in the logout dialog$/) do
  within('.swal2-container', wait: 10) do
    find('button.swal2-confirm', text: 'Confirm').click
  end
  expect(page).to_not have_selector('.swal2-container', wait: 10)
  sleep 0.5
end

Then(/^I should not see my email "([^"]*)" in the header$/) do |email|
  expect(page).to have_no_text(email, wait: 10)
end

When(/^I click on the "([^"]*)" sidebar link$/) do |link_text|
  find('div', text: /^#{link_text}$/, wait: 10).click
end

When(/^I hover over settings$/) do
  setting_trigger = find('div, button', text: /Setting/i, wait: 15, match: :first)
  setting_trigger.hover
  sleep 0.5
end