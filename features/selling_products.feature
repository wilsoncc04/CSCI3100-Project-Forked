Feature: Selling Products Management
  As a seller
  I want to manage the products I am currently selling
  So that I can update, view, or remove them from the marketplace

  Background:
    Given the following categories exist:
      | name        |
      | Electronics |
    And the following users exist:
      | email                       | name   | password    |
      | 1155000001@link.cuhk.edu.hk | Seller | password123 |
    And I am logged in as "1155000001@link.cuhk.edu.hk"
    And I have the following products in my selling list:
      | name           | price | status    |
      | Vintage Camera | 500   | available |
      | Used Bicycle   | 1200  | reserved  |

  @javascript
  Scenario: Successfully viewing the selling list
    When I navigate to my selling products page
    Then I should see a table row for "Vintage Camera" with price "500" and status "available"
    And I should see a table row for "Used Bicycle" with price "1200" and status "reserved"

  @javascript
  Scenario: Navigating to the product edit page
    When I navigate to my selling products page
    And I click the "Edit" button for "Vintage Camera"
    # 動機：使用產品名稱來對應動態生成的 ID
    Then I should be redirected to the edit page for "Vintage Camera"

  @javascript
  Scenario: Navigating to the product detail view
    When I navigate to my selling products page
    And I click the view icon for "Used Bicycle"
    Then I should be redirected to the detail page for "Used Bicycle"

  @javascript
  Scenario: Deleting a product with confirmation
    When I navigate to my selling products page
    And I click the "Delete" button for "Vintage Camera"
    # 動機：處理 JavaScript 的 confirm() 彈窗
    And I confirm the deletion dialog
    Then I should see the text "Product deleted successfully!"
    And the product "Vintage Camera" should no longer be in the list

  @javascript
  Scenario: Viewing the empty state
    Given I have no products listed for sale
    When I navigate to my selling products page
    Then I should see the text "You haven't listed any products yet."