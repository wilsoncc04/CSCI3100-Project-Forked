@javascript
Feature: Sell an Item
  As a student seller
  I want to list my items on the marketplace
  So that others can find and buy them

  Scenario: Successfully submit a new item listing
    Given I am on the marketplace index page
    When I click the "Sell" link
    Then I should see the text "Sell an Item"
    And I should see the text "Upload Photo (Drag & Drop)"
    When I fill in "Product Name" with "My Old Calculus Book"
    And I fill in "Price (HKD) $" with "200"
    And I fill in "Description" with "Almost new, no highlights."
    And I fill in "Contact (Phone or Email)" with "student@link.cuhk.edu.hk"
    And I accept the prompt after clicking "Confirm"
    Then I should see a success alert with "Product listed successfully!"