Feature: Product Information and Purchase Initiation
  As a buyer or seller
  I want to view detailed product information, expand images, and interact with the listing
  So that I can make a purchase decision or manage my own item

  Background:
    Given all categories exist
    And the following users exist:
      | email                       | name         |
      | 1155000001@link.cuhk.edu.hk | Alice Seller |
      | 1155000002@link.cuhk.edu.hk | Bob Buyer    |
    And the following products exist:
      | name            | price | seller                      | category          |
      | Scientific Calc | 200   | 1155000001@link.cuhk.edu.hk | Textbooks & Notes |

  @javascript
  Scenario: Viewing product details and image modal gallery
    Given the product "Scientific Calc" has 3 uploaded images
    And I am on the product details page for "Scientific Calc"
    Then I should see "Scientific Calc"
    And I should see a "Price History Graph" section
    When I click the main product photo
    Then a full-screen image modal should open
    When I click the right navigation arrow
    Then the modal should display the next image
    When I click the close button
    Then the image modal should disappear

  @javascript
  Scenario: Interacting with the "Interested" and "Buy" buttons as a buyer
    Given I am logged in as "1155000002@link.cuhk.edu.hk"
    And I am on the product details page for "Scientific Calc"
    When I click the "Interested" button
    Then the button should indicate that the product is liked
    When I click the "Buy" button
    Then I should see an alert prompt "Confirm interest in buying Scientific Calc?"

  @javascript
  Scenario: Owner deleting their own product
    Given I am logged in as "1155000001@link.cuhk.edu.hk"
    And I am on the product details page for "Scientific Calc"
    Then I should not see the "Buy" button
    But I should see the "Edit" button
    And I should see the "Delete" button
    When I click the "Delete" button
    And I accept the prompt
    Then I should see a success notification "Product deleted successfully."
    And I should be redirected to the home page

  @javascript
  Scenario: Owner cancelling the deletion of their product
    Given I am logged in as "1155000001@link.cuhk.edu.hk"
    And I am on the product details page for "Scientific Calc"
    When I click the "Delete" button
    And I dismiss the prompt
    Then I should see the "Edit" button
    And I should see the "Delete" button