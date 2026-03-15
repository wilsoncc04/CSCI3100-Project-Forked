require 'uri'
require 'cgi'
require File.expand_path(File.join(File.dirname(__FILE__), "..", "support", "paths"))

Given(/^(?:|I )am on (.+)$/) do |page_name|
  visit path_to(page_name)
end

Then(/^the "(.*)" dropdown should contain the following options:$/) do |dropdown_name, table|
  expected_options = table.raw.flatten
  dropdown = find_field(dropdown_name)
  actual_options = dropdown.all('option').map(&:text)
  expected_options.each do |option|
    expect(actual_options).to include(option)
  end
end