@javascript
Feature: Sell an Item
  As a student seller
  I want to list my items on the marketplace
  So that others can find and buy them

  Scenario: Successfully submit a new item listing
    Given I am on the marketplace index page
    And I am logged in as "1155000001@link.cuhk.edu.hk" with password "password"
    And all categories exist
    When I click the "Sell" link
    Then I should see the text "Sell an Item"
    And I should see the text "Upload Photos (Click or Drag & Drop)"
    When I fill in "Product Name" with "My Old Calculus Book"
    And I fill in "Price (HKD) $" with "200"
    And I select "Textbooks & Notes" from the category dropdown
    And I fill in "Description" with "Almost new, no highlights."
    And I fill in "Contact Info (Phone / IG / Email)" with "student@link.cuhk.edu.hk"
    And I click "Confirm Listing"
    Then I should see the text "My Old Calculus Book"