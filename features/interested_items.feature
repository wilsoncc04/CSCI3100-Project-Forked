Feature: Interested Items List
  As a user
  I want to see a list of products I have marked as interested
  So that I can easily track and purchase them later

  Background:
    Given the following categories exist:
      | name        |
      | Electronics |
    And the following users exist:
      | email                       | name   | password    |
      | 1155000001@link.cuhk.edu.hk | Seller | password123 |
      | 1155000002@link.cuhk.edu.hk | Buyer  | password123 |
    And the following products exist:
      | name        | seller                      | category    | price |
      | MacBook Pro | 1155000001@link.cuhk.edu.hk | Electronics | 12000 |
      | iPad Air    | 1155000001@link.cuhk.edu.hk | Electronics | 4500  |
    And I am logged in as "1155000002@link.cuhk.edu.hk"
    And I have marked the following items as interested:
      | name        | status    |
      | MacBook Pro | available |
      | iPad Air    | sold      |

  @javascript
  Scenario: Successfully view the list of interested goods
    When I navigate to the interested items page
    Then I should see "MacBook Pro" with price "12000"
    And I should see "iPad Air" with price "4500"
    And the status for "iPad Air" should be "sold"

  @javascript
  Scenario: Navigate to product detail page when clicking an item
    When I navigate to the interested items page
    And I click on the item card for "MacBook Pro"
    Then I should be redirected to the product page for "MacBook Pro"

  @javascript
  Scenario: View empty state when no items are marked
    Given I have no interested items
    When I navigate to the interested items page
    Then I should see the text "You haven't marked any items as interested yet."