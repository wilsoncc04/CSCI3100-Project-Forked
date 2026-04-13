require 'uri'
require 'cgi'
require File.expand_path(File.join(File.dirname(__FILE__), "..", "support", "paths"))

Given(/^(?:|I )am on the (.+) page$/) do |page_name|
  case page_name
  when "home"
    visit "/"
  when "marketplace index"
    visit '/'
  when "profile"
    visit '/Account'
  when "sell"
    visit '/sell'
  when "community"
    visit '/community'
  else
    visit path_to(page_name)
  end
end

When(/^I click the "([^"]*)" (?:button|link)$/) do |text|
  click_link_or_button(text, match: :first)

  sleep 0.3
end

When(/^I (?:check|click) the "([^"]*)" checkbox$/) do |label_text|
  check(label_text, match: :first)   # Capybara's built-in check helper
end

When(/^I hover over the "(.*)" menu$/) do |menu_text|
  find('button', text: menu_text).hover
end

When(/^I fill in "([^"]*)" with "([^"]*)"$/) do |field_name, value|
  fill_in(field_name, with: value)
end

When(/^I select "(.*)" from the category dropdown$/) do |category_name|
  # 1. Trigger the dropdown
  find('[data-testid="category-dropdown-trigger"]').hover
  
  # 2. Instead of 'within', click the button directly using a specific selector
  # This is more resilient to the list disappearing because it's a single command
  find('[data-testid="category-dropdown-list"] button', text: category_name).click
  
  # 3. Wait for the list to actually disappear before moving to the next step
  # This ensures React has finished its re-render
  expect(page).to_not have_selector('[data-testid="category-dropdown-list"]')
end

When(/^I accept the prompt after clicking "([^"]*)"$/) do |button_name|
  @alert_message = accept_alert do
    click_button(button_name)
  end
end

Then(/^I should see the text "([^"]*)"$/) do |expected_text|
  expect(page).to have_content(expected_text)
end

Then(/^I should see the "([^"]*)" button$/) do |button_text|
  expect(page).to have_button(button_text)
end

Then(/^I should see the following category links:$/) do |table|
  expected_links = table.raw.flatten
  expected_links.each do |link_text|
    expect(page).to have_content(link_text)
  end
end

Then(/^I should see a success alert with "([^"]*)"$/) do |expected_message|
  expect(@alert_message).to eq(expected_message)
end
