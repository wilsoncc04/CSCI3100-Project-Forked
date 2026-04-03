require 'uri'
require 'cgi'
require File.expand_path(File.join(File.dirname(__FILE__), "..", "support", "paths"))

Given(/^(?:|I )am on (.+)$/) do |page_name|
  case page_name
  when "the marketplace index page"
    visit '/'
  else
    visit path_to(page_name)
  end
end

When(/^I click the "([^"]*)" (?:button|link)$/) do |text|
  click_link_or_button(text, match: :first)
end

When(/^I hover over the "(.*)" menu$/) do |menu_text|
  find('button', text: menu_text).hover
end

When(/^I fill in "([^"]*)" with "([^"]*)"$/) do |field_name, value|
  fill_in(field_name, with: value)
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
    expect(page).to have_link(link_text)
  end
end

Then(/^I should see a success alert with "([^"]*)"$/) do |expected_message|
  expect(@alert_message).to eq(expected_message)
end