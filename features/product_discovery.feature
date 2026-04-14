Feature: Product Discovery, Search, and Filtering
  As a student browsing the marketplace
  I want to search, filter, sort, and paginate through products
  So that I can efficiently find the items I want to buy

  Background:
    Given all categories exist
    And the following users exist:
      | email                       | password    | college        |
      | 1155123456@link.cuhk.edu.hk | password123 | Shaw College   |
      | 1155654321@link.cuhk.edu.hk | password123 | United College |
    And the following products exist:
      | name               | price | category           | seller                      | status    |
      | Intro to Calculus  | 100   | Textbooks & Notes  | 1155123456@link.cuhk.edu.hk | available |
      | Physics Notes      | 50    | Textbooks & Notes  | 1155654321@link.cuhk.edu.hk | available |
      | Calculus Textbook  | 120   | Textbooks & Notes  | 1155123456@link.cuhk.edu.hk | available |
      | Desk Lamp          | 30    | Furniture & Home   | 1155123456@link.cuhk.edu.hk | available |
      | Sold Chair         | 10    | Furniture & Home   | 1155654321@link.cuhk.edu.hk | sold      |

  @javascript
  Scenario: Viewing market statistics and default index page
    Given I am on the marketplace index page
    Then I should see the "Market Statistics" chart section
    And I should see the "Products" grid
    And I should see "Intro to Calculus"

  @javascript
  Scenario: Search by keyword shows matching products
    Given I am on the marketplace index page
    When I fill in "Search keywords..." with "Calculus"
    And I click "Search"
    Then I should see "Intro to Calculus"
    And I should see "Calculus Textbook"

  @javascript
  Scenario: Filtering by College
    Given I am on the marketplace index page
    When I hover over the "College" menu
    And I click "Shaw College"
    And I click "Search"
    Then I should see "Intro to Calculus"
    And I should see "Calculus Textbook"
    And I should see "Physics Notes"

  @javascript
  Scenario: Resetting all filters
    Given I am on the marketplace index page
    When I hover over the "College" menu
    And I click "Shaw College"
    And I click "Search"
    Then I should see "Intro to Calculus"
    When I click "Reset Filters"
    And I click "Search"
    Then I should see "Physics Notes"

  @javascript
  Scenario: Sort products by price (High to Low)
    Given I am on the marketplace index page
    When I hover over the Sort Dropdown
    And I click "Price: High to Low"
    Then I should see "Calculus Textbook"
    And I should see "Intro to Calculus"
    And I should see "Physics Notes"

  @javascript
  Scenario: Fuzzy search tolerates minor typos
    Given I am on the marketplace index page
    When I fill in "Search keywords..." with "Calculu"
    And I click "Search"
    Then I should see "Intro to Calculus"
    And I should see "Calculus Textbook"

  @javascript
  Scenario: Pagination controls behavior
    Given there are 20 available products in the database
    And I am on the marketplace index page
    Then I should see the "Next" pagination button
    When I click the "Next" pagination button
    Then I should see "Page 2 of 2"