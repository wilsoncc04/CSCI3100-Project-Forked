require 'uri'
require 'cgi'
require File.expand_path(File.join(File.dirname(__FILE__), "..", "support", "paths"))

Given(/^(?:|I )am on the (.+) page$/) do |page_name|
  clean_page_name = page_name.gsub(/\A["']|["']\Z/, '')
  case clean_page_name
  when "home"
    visit "/"
  when "marketplace index"
    visit '/'
  when "profile"
    visit '/Account'
  when "sell", "Sell an Item"
    visit '/sell'
  when "community"
    visit '/community'
  else
    visit path_to(page_name)
  end
end

When(/^I click the "([^"]*)" (?:button|link)$/) do |text|
  click_link_or_button(text, match: :first)

  sleep 0.5
end

When(/^I (?:check|click) the "([^"]*)" checkbox$/) do |label_text|
  check(label_text, match: :first)
end

When(/^I fill in "([^"]*)" with "([^"]*)"$/) do |field_name, value|
  fill_in(field_name, with: value)
end

When(/^I select "(.*)" from the category dropdown$/) do |category_name|
  find('[data-testid="category-dropdown-trigger"]').hover
  find('[data-testid="category-dropdown-list"] button', text: category_name).click
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

Then(/^I should see "([^"]*)" before "([^"]*)"$/) do |item1, item2|
  expect(page).to have_content(item1, wait: 5)
  expect(page).to have_content(item2, wait: 5)
  
  page_text = page.text
  expect(page_text.index(item1)).to be < page_text.index(item2)
end

Then(/^I should see the "([^"]*)" chart section$/) do |text|
  expect(page).to have_content(text)
end

Then(/^I should see the "([^"]*)" grid$/) do |text|
  expect(page).to have_content(text)
end

Then(/^I should be on the search results page$/) do
  expect(page).to have_current_path(/search/, ignore_query: true)
  expect(page).to have_content("Search Results")
end

When(/^I hover over the "(.*)" menu$/) do |menu_text|
  # Find the element with the menu text (button or label)
  begin
    menu_trigger = find('*, div', text: menu_text, match: :first, visible: :all, wait: 5)
  rescue Capybara::ElementNotFound
    menu_trigger = find('button', text: menu_text, match: :first, visible: :all)
  end
  
  # Move mouse to the element to trigger CSS :hover and React onMouseEnter
  menu_trigger.hover
  
  # Dispatch mouseenter event for React components
  page.execute_script(<<~JS, menu_trigger)
    arguments[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
    const wrapper = arguments[0].closest('[class*="Wrapper"]');
    if (wrapper) {
      wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
    }
  JS
  
  sleep 1.2
end

Given(/^there are (\d+) available products in the database$/) do |count|
  seller = User.first || User.create!(email: "1155888888@link.cuhk.edu.hk", password: "password", name: "Pagin Seller")
  category = Category.find_or_create_by!(category_name: "Others")
  
  count.to_i.times do |i|
    Product.create!(
      name: "Pagin Item #{i}", 
      price: 10, 
      category: category, 
      seller: seller, 
      status: "available",
      condition: "Brand New",
      description: "testing",
      contact: "test",
      location: "CUHK"
    )
  end
end

Then(/^I should see the "([^"]*)" pagination button$/) do |btn_text|
  expect(page).to have_button(btn_text)
end

Then(/^the "([^"]*)" pagination button should be enabled$/) do |btn_text|
  expect(page).to have_button(btn_text, disabled: false)
end


Given(/^I am not logged in$/) do
  Capybara.reset_sessions!
  visit '/'
  page.execute_script("window.localStorage.clear(); window.sessionStorage.clear();") rescue nil
end

Then(/^I should be on the "([^"]*)" page$/) do |page_name|
  expected_path = case page_name.downcase
                  when "home" then "/"
                  when "community" then "/community"
                  when "notifications" then "/notifications"
                  when "chat" then "/chat"
                  when "sell" then "/sell"
                  else "/#{page_name.downcase}"
                  end
                  
  expect(page).to have_current_path(expected_path, ignore_query: true, wait: 5)
end

When(/^I hover over the Sort Dropdown$/) do
  dropdown_regex = /Sorting|Price:|Date:|Sort by/i

  expect(page).to have_selector('*', text: dropdown_regex, visible: :all, wait: 5)

  targets = all('*', text: dropdown_regex, visible: :all)
  
  page.execute_script("arguments[0].click();", targets.last)
  
  sleep 0.5
end