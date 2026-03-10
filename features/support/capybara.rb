require 'capybara/rails'
require 'capybara/cucumber'

Capybara.server = :puma, { Silent: true }
Capybara.javascript_driver = :selenium_chrome_headless
