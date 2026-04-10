require 'uri'
require 'cgi'

Given(/^(?:|I )am on the profile page$/) do
  visit '/profile'
end

When(/^(?:|I )click on the "(.*)" sidebar link$/) do |link_text|
  within("nav") do
    click_link_text = find('div', text: link_text)
    click_link_text.click
  end
end

When(/^(?:|I )press the "(.*)" button$/) do |button_text|
  click_button(button_text)
end

When(/^(?:|I )fill in "(.*)" with "(.*)"$/) do |field_name, value|
  fill_in(field_name, with: value)
end

## Generic "I should see" step removed from this file to avoid ambiguity
## The project provides a shared implementation in search_steps.rb
## which will be used for assertions like `Then I should see "..."`.

Then(/^the purchase table should contain:$/) do |table|
  table.raw.each do |row|
    row.each do |cell|
      expect(page).to have_selector('td', text: cell)
    end
  end
end

When(/^(?:|I )confirm the logout dialog$/) do
  page.driver.browser.switch_to.alert.accept
end

def find_sidebar_item(text)
  find('div', text: text)
end
