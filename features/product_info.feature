@javascript
Feature: Product Details Information
  As a potential buyer
  I want to see the full details of a product
  So that I can decide whether to purchase it

  Scenario: View critical product information
    Given I am on the marketplace index page
    When I click the "View Details" button
    Then I should see the text "Product Details"
    And I should see the text "$150 HKD"
    And I should see the "Interested" button
    And I should see the text "Price History Graph"