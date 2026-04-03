Feature: React Works
  As a developer
  I want to ensure Cucumber can interact with my React frontend
  So that I can write reliable BDD tests

  @javascript
  Scenario: Index page renders products from API
    Given the following categories exist:
      | name |
      | Tech |
    And the following users exist:
      | email                     | password |
      | 1155000001@link.cuhk.edu.hk  | password |
    And the following products exist:
      | name           | price | category | seller                      |
      | MacBook Pro    | 2000  | Tech     | 1155000001@link.cuhk.edu.hk |
    When I am on the home page
    Then I should see "MacBook Pro"
    And I should see "$2000"
