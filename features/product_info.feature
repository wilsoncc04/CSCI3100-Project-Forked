@javascript
Feature: Product Details Information
  As a potential buyer
  I want to see the full details of a product
  So that I can decide whether to purchase it

  Background:
    Given the following categories exist:
      | name      |
      | Textbooks |
    And the following users exist:
      | email                        | password    | name   | college     |
      | 1155000001@link.cuhk.edu.hk | password123 | User A | Shaw        |
      | 1155000002@link.cuhk.edu.hk | password123 | User B | Morningside |
    And the following products exist:
      | name              | price | category  | seller                       |
      | Calculus Textbook | 150   | Textbooks | 1155000001@link.cuhk.edu.hk |

  Scenario: View critical product information
    Given I open the product details page for "Calculus Textbook"
    Then I should see the text "Product Details"
    And I should see the text "$150.0 HKD"
    And I should see the "Interested" button
    And I should see the "Buy" button

  Scenario: Seller cannot buy own product
    Given I am logged in as "1155000001@link.cuhk.edu.hk" with password "password123"
    When I open the product details page for "Calculus Textbook"
    Then the "Buy" button should not appear