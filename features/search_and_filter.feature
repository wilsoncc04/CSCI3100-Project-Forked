Feature: Search and Filter Products
  As a user
  I want to search, filter, and sort products
  So that I can find exactly what I am looking for

  Background:
    Given the following categories exist:
      | name      |
      | Textbooks |
      | Furniture |
    And the following users exist:
      | email                        | password | college |
      | 1155000001@link.cuhk.edu.hk  | password | Shaw    |
      | 1155000002@link.cuhk.edu.hk  | password | Morningside |
    And the following products exist:
      | name              | price | category  | seller                       |
      | Calculus Textbook | 100   | Textbooks | 1155000001@link.cuhk.edu.hk  |
      | Physics Book      | 150   | Textbooks | 1155000002@link.cuhk.edu.hk |
      | Wooden Chair      | 50    | Furniture | 1155000001@link.cuhk.edu.hk  |

  @javascript
  Scenario: Simple search by keywords
    Given I am on the home page
    When I fill in "Search keywords..." with "Calculus"
    And I click "Search"
    Then I should see "Calculus Textbook"
    And I should not see "Physics Book"
    And I should not see "Wooden Chair"

  @javascript
  Scenario: Filter by College
    Given I am on the home page
    When I hover over "College"
    And I click "Shaw"
    And I click "Search"
    Then I should see "Calculus Textbook"
    And I should see "Wooden Chair"
    And I should not see "Physics Book"

  @javascript
  Scenario: Filter by Goods Type
    Given I am on the home page
    When I hover over "Goods Type"
    And I click "Furniture"
    And I click "Search"
    Then I should see "Wooden Chair"
    And I should not see "Calculus Textbook"
    And I should not see "Physics Book"

  @javascript
  Scenario: Combined search and filter
    Given I am on the home page
    When I hover over "College"
    And I click "Shaw"
    And I fill in "Search keywords..." with "Chair"
    And I click "Search"
    Then I should see "Wooden Chair"
    And I should not see "Calculus Textbook"
