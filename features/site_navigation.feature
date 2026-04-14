Feature: Site Navigation and Session State
  As a marketplace user
  I want to use the navigation bar to access different pages and manage my session
  So that I can smoothly browse the platform and log in or out

  Background:
    Given the following users exist:
      | email                       | password    |
      | 1155123456@link.cuhk.edu.hk | password123 |

  @javascript
  Scenario: Guest user navigation dropdown
    Given I am on the home page
    And I am not logged in
    When I hover over the "Setting" menu
    Then I should see "Log in"
    And I should see "Register"
    And I should not see "Log out"

  @javascript
  Scenario: Logged-in user dropdown and logout flow
    Given I am logged in as "1155123456@link.cuhk.edu.hk"
    And I am on the home page
    When I hover over the "Setting" menu
    Then I should see "1155123456@link.cuhk.edu.hk"
    And I should see "Account Info"
    And I should see "Log out"
    When I click "Log out"
    Then I should see an alert prompt "Are you sure you want to log out?"
    When I accept the prompt
    Then I should see a success notification "Logged out successfully."
    And I should be on the "Home" page

  @javascript
  Scenario: Header navigation links routing
    Given I am logged in as "1155123456@link.cuhk.edu.hk"
    And I am on the home page
    
    When I click the "Community" button
    Then I should be on the "Community" page

    When I click the "Notifications" button
    Then I should be on the "Notifications" page

    When I click the "Chat" button
    Then I should be on the "Chat" page

    When I click the "Sell" button
    Then I should be on the "Sell" page

    When I click the "CUHK Second-hand Marketplace" link
    Then I should be on the "Home" page