Feature: User Logout
  As a user
  So that I can protect my privacy on shared devices
  I want to safely log out of my account

  Background:
    Given the following categories exist:
      | name        |
      | Electronics |
    Given the following users exist:
      | email                       | name   | password    |
      | 1155000002@link.cuhk.edu.hk | Harvey | password123 |

  @javascript
  Scenario: Successful logout via Sidebar
    Given I am on the profile page
    And I am logged in as "1155000002@link.cuhk.edu.hk"
    When I click on the "Log out" sidebar link
    And I click "Confirm" in the logout dialog
    Then I should be redirected to the login page
    When I hover over settings
    Then I should not see my email "1155000002@link.cuhk.edu.hk" in the header

  @javascript
  Scenario: Successful logout via Header Dropdown
    Given I am on the home page
    And I am logged in as "1155000002@link.cuhk.edu.hk"
    When I hover over settings
    And I click on the "Log out" dropdown link
    And I click "Confirm" in the logout dialog
    Then I should be redirected to the home page
    When I hover over settings
    Then I should not see my email "1155000002@link.cuhk.edu.hk" in the header